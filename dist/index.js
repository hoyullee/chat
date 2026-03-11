#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_commander = require("commander");

// src/core/scaffolder.ts
var import_path3 = __toESM(require("path"));

// src/utils/fs.ts
var import_fs_extra = __toESM(require("fs-extra"));
var import_path = __toESM(require("path"));

// src/utils/template.ts
var import_ejs = __toESM(require("ejs"));
async function renderFile(filePath, context) {
  return import_ejs.default.renderFile(filePath, context, { async: true });
}
function toPascalCase(str) {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "").replace(/^(.)/, (c) => c.toUpperCase());
}
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
}

// src/utils/fs.ts
async function ensureProjectDir(dirPath) {
  const exists = await import_fs_extra.default.pathExists(dirPath);
  if (exists) {
    const contents = await import_fs_extra.default.readdir(dirPath);
    if (contents.length > 0) {
      throw new Error(`\uB514\uB809\uD1A0\uB9AC '${dirPath}'\uAC00 \uC774\uBBF8 \uC874\uC7AC\uD558\uBA70 \uBE44\uC5B4\uC788\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`);
    }
  }
  await import_fs_extra.default.ensureDir(dirPath);
}
async function copyTemplate(srcDir, destDir, context) {
  const created = [];
  async function walk(src, dest) {
    const items = await import_fs_extra.default.readdir(src);
    for (const item of items) {
      const srcPath = import_path.default.join(src, item);
      const stat = await import_fs_extra.default.stat(srcPath);
      const destItem = item.endsWith(".ejs") ? item.slice(0, -4) : item;
      const destPath = import_path.default.join(dest, destItem);
      if (stat.isDirectory()) {
        await import_fs_extra.default.ensureDir(destPath);
        await walk(srcPath, destPath);
      } else if (item.endsWith(".ejs")) {
        await import_fs_extra.default.ensureDir(import_path.default.dirname(destPath));
        const rendered = await renderFile(srcPath, context);
        await import_fs_extra.default.writeFile(destPath, rendered, "utf-8");
        created.push({ path: destPath, type: "generated" });
      } else {
        await import_fs_extra.default.ensureDir(import_path.default.dirname(destPath));
        await import_fs_extra.default.copy(srcPath, destPath);
        created.push({ path: destPath, type: "copied" });
      }
    }
  }
  await walk(srcDir, destDir);
  return created;
}
async function writeJson(filePath, data) {
  await import_fs_extra.default.ensureDir(import_path.default.dirname(filePath));
  await import_fs_extra.default.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}
async function readJson(filePath) {
  return import_fs_extra.default.readJson(filePath);
}
function pathExists(filePath) {
  return import_fs_extra.default.pathExists(filePath);
}

// src/core/config.ts
var import_path2 = __toESM(require("path"));
var CONFIG_FILENAME = ".chatclirc.json";
async function findProjectRoot(startDir = process.cwd()) {
  let current = startDir;
  while (true) {
    const configPath = import_path2.default.join(current, CONFIG_FILENAME);
    if (await pathExists(configPath)) return current;
    const parent = import_path2.default.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}
async function isInsideProject() {
  return await findProjectRoot() !== null;
}
async function readConfig() {
  const root = await findProjectRoot();
  if (!root) throw new Error("chat-cli \uD504\uB85C\uC81D\uD2B8 \uB0B4\uBD80\uC5D0\uC11C \uC2E4\uD589\uD574\uC8FC\uC138\uC694. (chat-cli init\uC73C\uB85C \uD504\uB85C\uC81D\uD2B8 \uC0DD\uC131)");
  return readJson(import_path2.default.join(root, CONFIG_FILENAME));
}
async function writeConfig(config, projectDir) {
  await writeJson(import_path2.default.join(projectDir, CONFIG_FILENAME), config);
}

// src/utils/git.ts
var import_execa = require("execa");
async function gitInit(cwd) {
  try {
    await (0, import_execa.execa)("git", ["init"], { cwd });
    await (0, import_execa.execa)("git", ["add", "-A"], { cwd });
    await (0, import_execa.execa)("git", ["commit", "-m", "chore: initial scaffold by chat-cli"], { cwd });
  } catch {
  }
}

// src/utils/package-manager.ts
var import_execa2 = require("execa");
async function isPnpmInstalled() {
  try {
    await (0, import_execa2.execa)("pnpm", ["--version"]);
    return true;
  } catch {
    return false;
  }
}
async function installDependencies(cwd) {
  const installed = await isPnpmInstalled();
  if (!installed) {
    throw new Error(
      "pnpm\uC774 \uC124\uCE58\uB418\uC5B4 \uC788\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.\n\uC124\uCE58 \uBC29\uBC95: npm install -g pnpm\n\uB610\uB294: https://pnpm.io"
    );
  }
  await (0, import_execa2.execa)("pnpm", ["install"], {
    cwd,
    stdio: "inherit"
  });
}

// src/ui/spinner.ts
var import_ora = __toESM(require("ora"));
var isCI = process.env.CI === "true";
function createSpinner(text) {
  return (0, import_ora.default)({
    text,
    isSilent: isCI
  });
}
async function withSpinner(text, fn) {
  const spinner = createSpinner(text);
  spinner.start();
  try {
    const result = await fn();
    spinner.succeed();
    return result;
  } catch (err) {
    spinner.fail();
    throw err;
  }
}

// src/ui/logger.ts
var import_chalk = __toESM(require("chalk"));
var isCI2 = process.env.CI === "true";
var logger = {
  info: (msg) => console.log(import_chalk.default.cyan("\u2139"), msg),
  success: (msg) => console.log(import_chalk.default.green("\u2713"), msg),
  warn: (msg) => console.log(import_chalk.default.yellow("\u26A0"), msg),
  error: (msg) => console.error(import_chalk.default.red("\u2717"), msg),
  log: (msg) => console.log(msg),
  blank: () => console.log(),
  step: (n, total, msg) => console.log(import_chalk.default.gray(`[${n}/${total}]`), msg)
};

// src/core/scaffolder.ts
async function scaffold(config, targetDir) {
  const projectDir = import_path3.default.resolve(targetDir, config.name);
  await withSpinner("\uD504\uB85C\uC81D\uD2B8 \uB514\uB809\uD1A0\uB9AC \uC0DD\uC131 \uC911...", async () => {
    await ensureProjectDir(projectDir);
  });
  const context = {
    projectName: config.name,
    projectNamePascal: toPascalCase(config.name),
    projectNameKebab: toKebabCase(config.name),
    projectNameCamel: toCamelCase(config.name),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    platforms: config.platforms,
    features: config.features
  };
  const templateBase = import_path3.default.resolve(__dirname, "../templates/project");
  await withSpinner("\uD504\uB85C\uC81D\uD2B8 \uAD6C\uC870 \uC0DD\uC131 \uC911...", async () => {
    await copyTemplate(import_path3.default.join(templateBase, "_root"), projectDir, context);
  });
  for (const platform of config.platforms) {
    await withSpinner(`${platform} \uC571 \uC0DD\uC131 \uC911...`, async () => {
      const platformSrc = import_path3.default.join(templateBase, "apps", platform);
      const platformDest = import_path3.default.join(projectDir, "apps", platform);
      await copyTemplate(platformSrc, platformDest, context);
    });
  }
  await withSpinner("\uACF5\uC720 \uD328\uD0A4\uC9C0 \uC0DD\uC131 \uC911...", async () => {
    await copyTemplate(
      import_path3.default.join(templateBase, "packages"),
      import_path3.default.join(projectDir, "packages"),
      context
    );
  });
  await writeConfig(config, projectDir);
  await withSpinner("Git \uCD08\uAE30\uD654 \uC911...", async () => {
    await gitInit(projectDir);
  });
  logger.blank();
  logger.info("\uC758\uC874\uC131 \uC124\uCE58 \uC911... (\uC2DC\uAC04\uC774 \uAC78\uB9B4 \uC218 \uC788\uC2B5\uB2C8\uB2E4)");
  await installDependencies(projectDir);
}

// src/prompts/init-prompts.ts
var import_prompts = require("@inquirer/prompts");

// src/core/validator.ts
var VALID_GENERATOR_TYPES = ["screen", "api", "socket", "emoticon"];
function validateProjectName(name) {
  if (!name) return "\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.";
  if (!/^[a-z0-9-]+$/.test(name)) return "\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC740 \uC18C\uBB38\uC790, \uC22B\uC790, \uD558\uC774\uD508(-)\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.";
  if (name.startsWith("-") || name.endsWith("-")) return "\uD558\uC774\uD508\uC73C\uB85C \uC2DC\uC791\uD558\uAC70\uB098 \uB05D\uB0A0 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
  if (name.length < 2) return "\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC740 2\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.";
  if (name.length > 50) return "\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC740 50\uC790 \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4.";
  return true;
}
function validateGeneratorType(type) {
  return VALID_GENERATOR_TYPES.includes(type);
}
function validateScreenName(name) {
  if (!name) return "\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.";
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) return "\uD654\uBA74 \uC774\uB984\uC740 PascalCase\uC5EC\uC57C \uD569\uB2C8\uB2E4. (\uC608: FriendList)";
  return true;
}
function validateApiName(name) {
  if (!name) return "\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.";
  if (!/^[a-z][a-z0-9-]*$/.test(name)) return "API \uC774\uB984\uC740 \uC18C\uBB38\uC790 kebab-case\uC5EC\uC57C \uD569\uB2C8\uB2E4. (\uC608: friend-list)";
  return true;
}

// src/prompts/init-prompts.ts
async function runInitPrompts(nameArg, options) {
  const isCI3 = process.env.CI === "true" || options.nonInteractive;
  if (options.preset === "kakao-like") {
    const name2 = nameArg || "my-chat-app";
    const validation = validateProjectName(name2);
    if (validation !== true) throw new Error(validation);
    return {
      name: name2,
      version: "0.1.0",
      platforms: ["mobile", "desktop", "server"],
      packageManager: "pnpm",
      features: { auth: true, friends: true, chat: true, emoticons: true }
    };
  }
  let name;
  if (nameArg) {
    const validation = validateProjectName(nameArg);
    if (validation !== true) throw new Error(validation);
    name = nameArg;
  } else if (isCI3) {
    throw new Error("--non-interactive \uBAA8\uB4DC\uC5D0\uC11C\uB294 \uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC744 \uC778\uC790\uB85C \uC81C\uACF5\uD574\uC57C \uD569\uB2C8\uB2E4.\n\uC0AC\uC6A9\uBC95: chat-cli init <name> --non-interactive");
  } else {
    name = await (0, import_prompts.input)({
      message: "\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694",
      default: "my-chat-app",
      validate: (v) => validateProjectName(v)
    });
  }
  let platforms;
  if (options.platform) {
    platforms = options.platform.split(",").map((p) => p.trim());
  } else if (isCI3) {
    platforms = ["mobile", "desktop", "server"];
  } else {
    platforms = await (0, import_prompts.checkbox)({
      message: "\uC9C0\uC6D0\uD560 \uD50C\uB7AB\uD3FC\uC744 \uC120\uD0DD\uD558\uC138\uC694",
      choices: [
        { name: "Android / iOS (React Native + Expo)", value: "mobile", checked: true },
        { name: "Windows / macOS (Electron)", value: "desktop", checked: true },
        { name: "Backend Server (NestJS)", value: "server", checked: true }
      ]
    });
    if (platforms.length === 0) throw new Error("\uCD5C\uC18C \uD558\uB098 \uC774\uC0C1\uC758 \uD50C\uB7AB\uD3FC\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694.");
  }
  let includeEmoticons;
  if (isCI3) {
    includeEmoticons = true;
  } else {
    includeEmoticons = await (0, import_prompts.confirm)({ message: "\uC774\uBAA8\uD2F0\uCF58 \uAE30\uB2A5\uC744 \uD3EC\uD568\uD560\uAE4C\uC694?", default: true });
  }
  return {
    name,
    version: "0.1.0",
    platforms,
    packageManager: "pnpm",
    features: {
      auth: true,
      friends: true,
      chat: true,
      emoticons: includeEmoticons
    }
  };
}

// src/ui/banner.ts
var import_boxen = __toESM(require("boxen"));
var import_chalk2 = __toESM(require("chalk"));
function showWelcomeBanner() {
  const banner = (0, import_boxen.default)(
    import_chalk2.default.bold.cyan("chat-cli") + "\n" + import_chalk2.default.gray("Cross-platform chat app scaffold tool"),
    {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "cyan"
    }
  );
  console.log(banner);
}
function showSuccessBanner(projectName, platforms) {
  const lines = [
    import_chalk2.default.bold.green(`\u2713 ${projectName} \uD504\uB85C\uC81D\uD2B8\uAC00 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4!`),
    "",
    import_chalk2.default.white("\uB2E4\uC74C \uB2E8\uACC4:"),
    import_chalk2.default.cyan(`  cd ${projectName}`),
    import_chalk2.default.cyan("  chat-cli dev"),
    "",
    import_chalk2.default.gray(`\uD50C\uB7AB\uD3FC: ${platforms.join(", ")}`)
  ];
  const banner = (0, import_boxen.default)(lines.join("\n"), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "green"
  });
  console.log(banner);
}
function showDevBanner(services) {
  const lines = [
    import_chalk2.default.bold("Chat App Dev Server"),
    "",
    ...services.map(
      (s) => `  ${import_chalk2.default.gray("\u25C6")} ${import_chalk2.default.white(s.name.padEnd(12))} ${import_chalk2.default.cyan(s.url.padEnd(32))} ${s.status === "running" ? import_chalk2.default.green("\u2713") : import_chalk2.default.red("\u2717")}`
    )
  ];
  const banner = (0, import_boxen.default)(lines.join("\n"), {
    padding: 1,
    borderStyle: "round",
    borderColor: "cyan"
  });
  console.log(banner);
}

// src/ui/table.ts
var import_cli_table3 = __toESM(require("cli-table3"));
var import_chalk3 = __toESM(require("chalk"));
function showGeneratedFilesTable(files) {
  const table = new import_cli_table3.default({
    head: [import_chalk3.default.cyan("\uD30C\uC77C"), import_chalk3.default.cyan("\uC720\uD615")],
    style: { head: [], border: ["gray"] }
  });
  for (const file of files) {
    table.push([import_chalk3.default.white(file.path), import_chalk3.default.gray(file.type)]);
  }
  console.log(table.toString());
}
function showProjectSummaryTable(config) {
  const table = new import_cli_table3.default({
    style: { head: [], border: ["gray"] }
  });
  table.push(
    [import_chalk3.default.gray("\uD504\uB85C\uC81D\uD2B8\uBA85"), import_chalk3.default.white(config.name)],
    [import_chalk3.default.gray("\uD50C\uB7AB\uD3FC"), import_chalk3.default.white(config.platforms.join(", "))],
    [
      import_chalk3.default.gray("\uAE30\uB2A5"),
      import_chalk3.default.white(
        Object.entries(config.features).filter(([, v]) => v).map(([k]) => k).join(", ")
      )
    ]
  );
  console.log(table.toString());
}
function showEmoticonPacksTable(packs) {
  if (packs.length === 0) {
    console.log(import_chalk3.default.gray("  \uC124\uCE58\uB41C \uC774\uBAA8\uD2F0\uCF58 \uD329\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."));
    return;
  }
  const table = new import_cli_table3.default({
    head: [
      import_chalk3.default.cyan("ID"),
      import_chalk3.default.cyan("\uC774\uB984"),
      import_chalk3.default.cyan("\uC81C\uC791\uC790"),
      import_chalk3.default.cyan("\uBC84\uC804"),
      import_chalk3.default.cyan("\uB77C\uC774\uC120\uC2A4")
    ],
    style: { head: [], border: ["gray"] }
  });
  for (const pack of packs) {
    table.push([
      import_chalk3.default.white(pack.id),
      import_chalk3.default.white(pack.name),
      import_chalk3.default.gray(pack.author),
      import_chalk3.default.gray(pack.version),
      pack.license === "free" ? import_chalk3.default.green(pack.license) : import_chalk3.default.yellow(pack.license)
    ]);
  }
  console.log(table.toString());
}

// src/commands/init.ts
var import_prompts2 = require("@inquirer/prompts");
function registerInitCommand(program2) {
  program2.command("init [name]").description("\uC0C8 \uCC44\uD305 \uC571 \uD504\uB85C\uC81D\uD2B8\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4").option("-t, --template <template>", "\uD504\uB85C\uC81D\uD2B8 \uD15C\uD50C\uB9BF", "full").option("-p, --platform <platforms>", "\uD50C\uB7AB\uD3FC (mobile,desktop,server)").option("--non-interactive", "CI \uD658\uACBD\uC6A9 \uBE44\uC778\uD130\uB799\uD2F0\uBE0C \uBAA8\uB4DC").option("--preset <preset>", "\uC0AC\uC804 \uC124\uC815 (kakao-like)").action(async (name, options) => {
    showWelcomeBanner();
    try {
      const config = await runInitPrompts(name, options);
      logger.blank();
      showProjectSummaryTable({
        name: config.name,
        platforms: config.platforms,
        features: config.features
      });
      logger.blank();
      if (!options.nonInteractive && process.env.CI !== "true") {
        const ok = await (0, import_prompts2.confirm)({ message: "\uC774 \uC124\uC815\uC73C\uB85C \uD504\uB85C\uC81D\uD2B8\uB97C \uC0DD\uC131\uD560\uAE4C\uC694?", default: true });
        if (!ok) {
          logger.warn("\uCDE8\uC18C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
          return;
        }
      }
      logger.blank();
      await scaffold(config, process.cwd());
      logger.blank();
      showSuccessBanner(config.name, config.platforms);
    } catch (err) {
      logger.error(err.message);
      process.exit(1);
    }
  });
}

// src/commands/dev.ts
var import_prompts3 = require("@inquirer/prompts");

// src/core/runner.ts
var import_execa3 = require("execa");
async function runDevServer(platform) {
  const root = await findProjectRoot();
  if (!root) throw new Error("\uD504\uB85C\uC81D\uD2B8 \uB8E8\uD2B8\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const filter = platform === "all" ? [] : [`--filter=./apps/${platform}`];
  await (0, import_execa3.execa)("pnpm", ["turbo", "run", "dev", ...filter], {
    cwd: root,
    stdio: "inherit"
  });
}
async function runBuild(platform, options = {}) {
  const root = await findProjectRoot();
  if (!root) throw new Error("\uD504\uB85C\uC81D\uD2B8 \uB8E8\uD2B8\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const filter = platform === "all" ? [] : [`--filter=./apps/${platform}`];
  const env = options.analyze ? { ...process.env, BUNDLE_ANALYZE: "true" } : process.env;
  await (0, import_execa3.execa)("pnpm", ["turbo", "run", "build", ...filter], {
    cwd: root,
    stdio: "inherit",
    env
  });
}

// src/commands/dev.ts
function registerDevCommand(program2) {
  program2.command("dev [platform]").description("\uAC1C\uBC1C \uC11C\uBC84\uB97C \uC2DC\uC791\uD569\uB2C8\uB2E4").option("--port <port>", "\uC11C\uBC84 \uD3EC\uD2B8", "3000").action(async (platformArg, _options) => {
    try {
      if (!await isInsideProject()) {
        logger.error("chat-cli \uD504\uB85C\uC81D\uD2B8 \uB0B4\uBD80\uC5D0\uC11C \uC2E4\uD589\uD574\uC8FC\uC138\uC694.");
        logger.info("\uC0C8 \uD504\uB85C\uC81D\uD2B8 \uC0DD\uC131: chat-cli init <name>");
        process.exit(1);
      }
      const config = await readConfig();
      let platform;
      if (platformArg) {
        platform = platformArg;
      } else if (process.env.CI === "true") {
        platform = "all";
      } else {
        platform = await (0, import_prompts3.select)({
          message: "\uC2DC\uC791\uD560 \uD50C\uB7AB\uD3FC\uC744 \uC120\uD0DD\uD558\uC138\uC694",
          choices: [
            { name: "\uC804\uCCB4", value: "all" },
            ...config.platforms.map((p) => ({ name: p, value: p }))
          ]
        });
      }
      const services = config.platforms.map((p) => ({
        name: p,
        url: p === "server" ? "http://localhost:3000" : p === "mobile" ? "Expo :8081" : "Electron",
        status: "running"
      }));
      showDevBanner(services);
      logger.blank();
      await runDevServer(platform);
    } catch (err) {
      logger.error(err.message);
      process.exit(1);
    }
  });
}

// src/core/generator.ts
var import_path4 = __toESM(require("path"));
var import_fs_extra2 = __toESM(require("fs-extra"));
async function generate(type, name) {
  const root = await findProjectRoot();
  if (!root) throw new Error("\uD504\uB85C\uC81D\uD2B8 \uB8E8\uD2B8\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const context = {
    name,
    namePascal: toPascalCase(name),
    nameKebab: toKebabCase(name),
    nameCamel: toCamelCase(name)
  };
  const templateBase = import_path4.default.resolve(__dirname, "../templates");
  switch (type) {
    case "screen":
      return generateScreen(root, context, templateBase);
    case "api":
      return generateApi(root, context, templateBase);
    case "socket":
      return generateSocket(root, context, templateBase);
    case "emoticon":
      return generateEmoticon(root, context, templateBase);
  }
}
async function generateScreen(root, ctx, templateBase) {
  const files = [];
  const hints = [];
  const mobileSrc = import_path4.default.join(templateBase, "screens", "mobile-screen.tsx.ejs");
  const mobileDest = import_path4.default.join(root, "apps", "mobile", "src", "screens", `${ctx.namePascal}Screen.tsx`);
  if (await import_fs_extra2.default.pathExists(mobileSrc)) {
    await import_fs_extra2.default.ensureDir(import_path4.default.dirname(mobileDest));
    const rendered = await renderFile(mobileSrc, ctx);
    await import_fs_extra2.default.writeFile(mobileDest, rendered, "utf-8");
    files.push({ path: `apps/mobile/src/screens/${ctx.namePascal}Screen.tsx`, type: "mobile screen" });
  }
  const desktopSrc = import_path4.default.join(templateBase, "screens", "desktop-page.tsx.ejs");
  const desktopDest = import_path4.default.join(root, "apps", "desktop", "src", "pages", `${ctx.namePascal}Page.tsx`);
  if (await import_fs_extra2.default.pathExists(desktopSrc)) {
    await import_fs_extra2.default.ensureDir(import_path4.default.dirname(desktopDest));
    const rendered = await renderFile(desktopSrc, ctx);
    await import_fs_extra2.default.writeFile(desktopDest, rendered, "utf-8");
    files.push({ path: `apps/desktop/src/pages/${ctx.namePascal}Page.tsx`, type: "desktop page" });
  }
  hints.push(`\u2192 navigation/MainNavigator.tsx \uC5D0 ${ctx.namePascal}Screen \uB77C\uC6B0\uD2B8 \uCD94\uAC00 \uD544\uC694`);
  return { files, hints };
}
async function generateApi(root, ctx, templateBase) {
  const files = [];
  const hints = [];
  const apiDir = import_path4.default.join(root, "apps", "server", "src", ctx.nameKebab);
  await import_fs_extra2.default.ensureDir(apiDir);
  for (const tpl of ["controller", "service", "module"]) {
    const src = import_path4.default.join(templateBase, "api", `nest-${tpl}.ts.ejs`);
    const dest = import_path4.default.join(apiDir, `${ctx.nameKebab}.${tpl}.ts`);
    if (await import_fs_extra2.default.pathExists(src)) {
      const rendered = await renderFile(src, ctx);
      await import_fs_extra2.default.writeFile(dest, rendered, "utf-8");
      files.push({ path: `apps/server/src/${ctx.nameKebab}/${ctx.nameKebab}.${tpl}.ts`, type: `nest ${tpl}` });
    }
  }
  hints.push(`\u2192 apps/server/src/app.module.ts \uC5D0 ${ctx.namePascal}Module import \uD544\uC694`);
  return { files, hints };
}
async function generateSocket(root, ctx, templateBase) {
  const files = [];
  const src = import_path4.default.join(templateBase, "socket", "nest-gateway.ts.ejs");
  const dest = import_path4.default.join(root, "apps", "server", "src", ctx.nameKebab, `${ctx.nameKebab}.gateway.ts`);
  if (await import_fs_extra2.default.pathExists(src)) {
    await import_fs_extra2.default.ensureDir(import_path4.default.dirname(dest));
    const rendered = await renderFile(src, ctx);
    await import_fs_extra2.default.writeFile(dest, rendered, "utf-8");
    files.push({ path: `apps/server/src/${ctx.nameKebab}/${ctx.nameKebab}.gateway.ts`, type: "socket gateway" });
  }
  return { files, hints: [`\u2192 ${ctx.namePascal}Module \uC5D0 ${ctx.namePascal}Gateway provider \uCD94\uAC00 \uD544\uC694`] };
}
async function generateEmoticon(root, ctx, templateBase) {
  const packDir = import_path4.default.join(root, "packages", "emoticons", ctx.nameKebab);
  await import_fs_extra2.default.ensureDir(import_path4.default.join(packDir, "images"));
  const manifest = {
    id: ctx.nameKebab,
    name: ctx.namePascal,
    author: "",
    version: "1.0.0",
    description: "",
    license: "free",
    images: [],
    emoticons: []
  };
  const manifestPath = import_path4.default.join(packDir, "manifest.json");
  await writeJson(manifestPath, manifest);
  const indexContent = `export { default as ${ctx.nameCamel}Pack } from './manifest.json';
`;
  await import_fs_extra2.default.writeFile(import_path4.default.join(packDir, "index.ts"), indexContent, "utf-8");
  return {
    files: [
      { path: `packages/emoticons/${ctx.nameKebab}/manifest.json`, type: "emoticon manifest" },
      { path: `packages/emoticons/${ctx.nameKebab}/index.ts`, type: "emoticon index" }
    ],
    hints: [`\u2192 packages/emoticons/${ctx.nameKebab}/images/ \uC5D0 \uC774\uBAA8\uD2F0\uCF58 \uC774\uBBF8\uC9C0 \uCD94\uAC00 \uD6C4 manifest.json \uC5C5\uB370\uC774\uD2B8`]
  };
}

// src/prompts/generate-prompts.ts
var import_prompts4 = require("@inquirer/prompts");
async function runGeneratePrompts(typeArg, nameArg) {
  let type;
  if (typeArg) {
    type = typeArg;
  } else {
    type = await (0, import_prompts4.select)({
      message: "\uC0DD\uC131\uD560 \uC720\uD615\uC744 \uC120\uD0DD\uD558\uC138\uC694",
      choices: [
        { name: "screen  - \uD654\uBA74 \uCEF4\uD3EC\uB10C\uD2B8 (mobile + desktop)", value: "screen" },
        { name: "api     - NestJS API \uBAA8\uB4C8 (controller + service + module)", value: "api" },
        { name: "socket  - Socket.io Gateway", value: "socket" },
        { name: "emoticon - \uC774\uBAA8\uD2F0\uCF58 \uD329", value: "emoticon" }
      ]
    });
  }
  let name;
  if (nameArg) {
    name = nameArg;
  } else {
    const isScreen = type === "screen";
    name = await (0, import_prompts4.input)({
      message: isScreen ? "\uD654\uBA74 \uC774\uB984 (PascalCase, \uC608: FriendList)" : "\uC774\uB984 (kebab-case, \uC608: friend-list)",
      validate: isScreen ? validateScreenName : validateApiName
    });
  }
  return { type, name };
}

// src/commands/generate.ts
var import_chalk4 = __toESM(require("chalk"));
function registerGenerateCommand(program2) {
  program2.command("generate [type] [name]").alias("g").description("\uCF54\uB4DC\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4 (screen | api | socket | emoticon)").action(async (typeArg, nameArg) => {
    try {
      if (!await isInsideProject()) {
        logger.error("chat-cli \uD504\uB85C\uC81D\uD2B8 \uB0B4\uBD80\uC5D0\uC11C \uC2E4\uD589\uD574\uC8FC\uC138\uC694.");
        process.exit(1);
      }
      if (typeArg && !validateGeneratorType(typeArg)) {
        logger.error(`\uC54C \uC218 \uC5C6\uB294 \uC720\uD615: '${typeArg}'`);
        logger.info("\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uC720\uD615: screen, api, socket, emoticon");
        process.exit(1);
      }
      const { type, name } = await runGeneratePrompts(typeArg, nameArg);
      logger.blank();
      logger.info(`${type} '${name}' \uC0DD\uC131 \uC911...`);
      const result = await generate(type, name);
      logger.blank();
      logger.success("\uC0DD\uC131 \uC644\uB8CC!");
      logger.blank();
      showGeneratedFilesTable(result.files);
      if (result.hints.length > 0) {
        logger.blank();
        logger.log(import_chalk4.default.gray("\uB2E4\uC74C \uB2E8\uACC4:"));
        result.hints.forEach((hint) => logger.log(import_chalk4.default.gray(hint)));
      }
    } catch (err) {
      logger.error(err.message);
      process.exit(1);
    }
  });
}

// src/commands/build.ts
var import_prompts5 = require("@inquirer/prompts");
function registerBuildCommand(program2) {
  program2.command("build [platform]").description("\uC571\uC744 \uBE4C\uB4DC\uD569\uB2C8\uB2E4").option("--analyze", "\uBC88\uB4E4 \uBD84\uC11D \uD65C\uC131\uD654").option("--env <env>", "\uD658\uACBD (staging | production)", "production").action(async (platformArg, options) => {
    try {
      if (!await isInsideProject()) {
        logger.error("chat-cli \uD504\uB85C\uC81D\uD2B8 \uB0B4\uBD80\uC5D0\uC11C \uC2E4\uD589\uD574\uC8FC\uC138\uC694.");
        process.exit(1);
      }
      const config = await readConfig();
      let platform;
      if (platformArg) {
        platform = platformArg;
      } else if (process.env.CI === "true") {
        platform = "all";
      } else {
        platform = await (0, import_prompts5.select)({
          message: "\uBE4C\uB4DC\uD560 \uD50C\uB7AB\uD3FC\uC744 \uC120\uD0DD\uD558\uC138\uC694",
          choices: [
            { name: "\uC804\uCCB4", value: "all" },
            ...config.platforms.map((p) => ({ name: p, value: p }))
          ]
        });
      }
      logger.info(`${platform} \uBE4C\uB4DC \uC2DC\uC791 (env: ${options.env})`);
      logger.blank();
      await runBuild(platform, { analyze: options.analyze });
      logger.blank();
      logger.success("\uBE4C\uB4DC \uC644\uB8CC!");
      if (platform === "mobile" || platform === "all") {
        logger.info("\uBAA8\uBC14\uC77C \uBC30\uD3EC: eas build --platform all");
      }
      if (platform === "desktop" || platform === "all") {
        logger.info("\uB370\uC2A4\uD06C\uD0D1 \uBE4C\uB4DC \uACB0\uACFC: apps/desktop/dist/");
      }
    } catch (err) {
      logger.error(err.message);
      process.exit(1);
    }
  });
}

// src/commands/emoticon.ts
var import_path5 = __toESM(require("path"));
var import_fs_extra3 = __toESM(require("fs-extra"));

// src/prompts/emoticon-prompts.ts
var import_prompts6 = require("@inquirer/prompts");
async function runEmoticonInitPrompts() {
  const name = await (0, import_prompts6.input)({ message: "\uC774\uBAA8\uD2F0\uCF58 \uD329 \uC774\uB984" });
  const author = await (0, import_prompts6.input)({ message: "\uC81C\uC791\uC790" });
  const license = await (0, import_prompts6.select)({
    message: "\uB77C\uC774\uC120\uC2A4",
    choices: [
      { name: "\uBB34\uB8CC (free)", value: "free" },
      { name: "\uC720\uB8CC (paid)", value: "paid" },
      { name: "\uCEE4\uC2A4\uD140 (custom)", value: "custom" }
    ]
  });
  const description = await (0, import_prompts6.input)({ message: "\uC124\uBA85 (\uC120\uD0DD\uC0AC\uD56D)", default: "" });
  return { name, author, license, description };
}

// src/commands/emoticon.ts
var MANIFEST_PATH = "packages/emoticons/manifest.json";
async function getManifest(root) {
  const manifestPath = import_path5.default.join(root, MANIFEST_PATH);
  if (!await import_fs_extra3.default.pathExists(manifestPath)) {
    return { version: "1.0.0", packs: [], updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  }
  return readJson(manifestPath);
}
async function saveManifest(root, manifest) {
  manifest.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  await writeJson(import_path5.default.join(root, MANIFEST_PATH), manifest);
}
function registerEmoticonCommand(program2) {
  const emoticon = program2.command("emoticon").description("\uC774\uBAA8\uD2F0\uCF58 \uD329\uC744 \uAD00\uB9AC\uD569\uB2C8\uB2E4");
  emoticon.command("init [name]").description("\uC0C8 \uC774\uBAA8\uD2F0\uCF58 \uD329\uC744 \uCD08\uAE30\uD654\uD569\uB2C8\uB2E4").action(async (nameArg) => {
    try {
      if (!await isInsideProject()) {
        logger.error("chat-cli \uD504\uB85C\uC81D\uD2B8 \uB0B4\uBD80\uC5D0\uC11C \uC2E4\uD589\uD574\uC8FC\uC138\uC694.");
        process.exit(1);
      }
      const root = await findProjectRoot();
      const info = await runEmoticonInitPrompts();
      const id = nameArg || toKebabCase(info.name);
      const packDir = import_path5.default.join(root, "packages", "emoticons", id);
      await withSpinner(`\uC774\uBAA8\uD2F0\uCF58 \uD329 '${id}' \uC0DD\uC131 \uC911...`, async () => {
        await import_fs_extra3.default.ensureDir(import_path5.default.join(packDir, "images"));
        const pack = { id, ...info, version: "1.0.0", images: [], emoticons: [] };
        await writeJson(import_path5.default.join(packDir, "manifest.json"), pack);
        await import_fs_extra3.default.writeFile(
          import_path5.default.join(packDir, "index.ts"),
          `export { default as ${id.replace(/-/g, "_")}Pack } from './manifest.json';
`,
          "utf-8"
        );
        const manifest = await getManifest(root);
        manifest.packs.push(pack);
        await saveManifest(root, manifest);
      });
      logger.success(`\uC774\uBAA8\uD2F0\uCF58 \uD329 '${id}' \uC0DD\uC131 \uC644\uB8CC!`);
      logger.info(`\uC774\uBBF8\uC9C0 \uCD94\uAC00: packages/emoticons/${id}/images/`);
    } catch (err) {
      logger.error(err.message);
      process.exit(1);
    }
  });
  emoticon.command("list").description("\uC124\uCE58\uB41C \uC774\uBAA8\uD2F0\uCF58 \uD329 \uBAA9\uB85D\uC744 \uD45C\uC2DC\uD569\uB2C8\uB2E4").action(async () => {
    try {
      if (!await isInsideProject()) {
        logger.error("chat-cli \uD504\uB85C\uC81D\uD2B8 \uB0B4\uBD80\uC5D0\uC11C \uC2E4\uD589\uD574\uC8FC\uC138\uC694.");
        process.exit(1);
      }
      const root = await findProjectRoot();
      const manifest = await getManifest(root);
      logger.blank();
      showEmoticonPacksTable(manifest.packs);
    } catch (err) {
      logger.error(err.message);
      process.exit(1);
    }
  });
  emoticon.command("remove <id>").description("\uC774\uBAA8\uD2F0\uCF58 \uD329\uC744 \uC81C\uAC70\uD569\uB2C8\uB2E4").action(async (id) => {
    try {
      if (!await isInsideProject()) {
        logger.error("chat-cli \uD504\uB85C\uC81D\uD2B8 \uB0B4\uBD80\uC5D0\uC11C \uC2E4\uD589\uD574\uC8FC\uC138\uC694.");
        process.exit(1);
      }
      const root = await findProjectRoot();
      const manifest = await getManifest(root);
      const idx = manifest.packs.findIndex((p) => p.id === id);
      if (idx === -1) {
        logger.error(`\uC774\uBAA8\uD2F0\uCF58 \uD329 '${id}'\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
        process.exit(1);
      }
      manifest.packs.splice(idx, 1);
      await saveManifest(root, manifest);
      await import_fs_extra3.default.remove(import_path5.default.join(root, "packages", "emoticons", id));
      logger.success(`\uC774\uBAA8\uD2F0\uCF58 \uD329 '${id}' \uC81C\uAC70 \uC644\uB8CC`);
    } catch (err) {
      logger.error(err.message);
      process.exit(1);
    }
  });
  emoticon.command("export").description("\uBAA8\uB4E0 \uC774\uBAA8\uD2F0\uCF58 \uD329\uC744 dist/emoticons/ \uB85C \uBC88\uB4E4\uB9C1\uD569\uB2C8\uB2E4").action(async () => {
    try {
      if (!await isInsideProject()) {
        logger.error("chat-cli \uD504\uB85C\uC81D\uD2B8 \uB0B4\uBD80\uC5D0\uC11C \uC2E4\uD589\uD574\uC8FC\uC138\uC694.");
        process.exit(1);
      }
      const root = await findProjectRoot();
      const manifest = await getManifest(root);
      const distDir = import_path5.default.join(root, "dist", "emoticons");
      await withSpinner("\uC774\uBAA8\uD2F0\uCF58 \uD329 \uBC88\uB4E4\uB9C1 \uC911...", async () => {
        await import_fs_extra3.default.ensureDir(distDir);
        for (const pack of manifest.packs) {
          const src = import_path5.default.join(root, "packages", "emoticons", pack.id);
          await import_fs_extra3.default.copy(src, import_path5.default.join(distDir, pack.id));
        }
        await writeJson(import_path5.default.join(distDir, "manifest.json"), manifest);
      });
      logger.success(`${manifest.packs.length}\uAC1C \uD329 \uBC88\uB4E4 \uC644\uB8CC \u2192 dist/emoticons/`);
    } catch (err) {
      logger.error(err.message);
      process.exit(1);
    }
  });
}

// src/index.ts
var program = new import_commander.Command();
program.name("chat-cli").description("\uCE74\uCE74\uC624\uD1A1 \uC2A4\uD0C0\uC77C \uCC44\uD305 \uC571 \uC2A4\uCE90\uD3F4\uB529 CLI \uB3C4\uAD6C").version("0.1.0").option("--no-color", "\uC0C9\uC0C1 \uCD9C\uB825 \uBE44\uD65C\uC131\uD654");
program.hook("preAction", () => {
  if (program.opts().noColor) {
    process.env.NO_COLOR = "1";
  }
});
registerInitCommand(program);
registerDevCommand(program);
registerGenerateCommand(program);
registerBuildCommand(program);
registerEmoticonCommand(program);
program.parseAsync(process.argv).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
