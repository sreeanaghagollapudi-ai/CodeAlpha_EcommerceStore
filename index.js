const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL } = require("url");

function express() {
  const middlewares = [];
  const routes = [];

  async function handle(req, res) {
    decorateResponse(res);

    const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    req.path = parsed.pathname;
    req.query = Object.fromEntries(parsed.searchParams.entries());

    const stack = [...middlewares];
    const match = routes.find((route) => route.method === req.method && matchRoute(route.path, req.path, req));
    if (match) stack.push(...match.handlers);
    else stack.push((request, response) => response.status(404).json({ message: "Not found" }));

    let index = 0;
    const next = async (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }

      const layer = stack[index++];
      if (!layer || res.writableEnded) return;

      try {
        if (layer.length >= 3) layer(req, res, next);
        else await layer(req, res);
      } catch (caught) {
        next(caught);
      }
    };

    next();
  }

  return {
    use(handler) {
      middlewares.push(handler);
    },
    get(routePath, ...handlers) {
      routes.push({ method: "GET", path: routePath, handlers });
    },
    post(routePath, ...handlers) {
      routes.push({ method: "POST", path: routePath, handlers });
    },
    listen(port, callback) {
      const server = http.createServer(handle);
      return server.listen(port, callback);
    }
  };
}

function decorateResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    if (res.writableEnded) return;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
  };
  res.sendFile = (filePath) => {
    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.statusCode = error.code === "ENOENT" ? 404 : 500;
        res.end();
        return;
      }
      res.setHeader("Content-Type", contentType(filePath));
      res.end(data);
    });
  };
}

function matchRoute(pattern, pathname, req) {
  req.params = {};
  if (pattern === "*") return true;

  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return false;

  return patternParts.every((part, index) => {
    if (part.startsWith(":")) {
      req.params[part.slice(1)] = decodeURIComponent(pathParts[index]);
      return true;
    }
    return part === pathParts[index];
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml"
  };
  return types[ext] || "application/octet-stream";
}

express.json = () => async (req, res, next) => {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) return next();

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    try {
      req.body = body ? JSON.parse(body) : {};
      next();
    } catch (error) {
      res.status(400).json({ message: "Invalid JSON body" });
    }
  });
};

express.static = (root) => (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();

  const requestPath = decodeURIComponent(req.path === "/" ? "/index.html" : req.path);
  const filePath = path.normalize(path.join(root, requestPath));
  if (!filePath.startsWith(root)) return res.status(403).json({ message: "Forbidden" });

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) return next();
    res.sendFile(filePath);
  });
};

module.exports = express;
