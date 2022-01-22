/* An overly complicated plain JS script to create new posts.
   Should be called as `yarn new`
 */

const { readFile, writeFile, mkdir } = require("fs/promises");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// copy-pasta from
// https://gist.githubusercontent.com/hagemann/382adfc57adbd5af078dc93feef01fe1/raw/a77da87ee9b9669f7462d51582755c06c9dc7fc7/slugify.js
const budgetSlugify = (title) => {
  const a =
    "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
  const b =
    "aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");

  return title
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

const createPost = ({ title, description }) => {
  // determine the output path, should be relative to the repo root
  const slug = budgetSlugify(title);
  const dateString = new Date().toISOString().slice(0, 10);
  const dirPath = `./content/post/${dateString}_${slug}`;
  const filePath = `${dirPath}/index.md`;

  console.log("Creating a new post at ", filePath);

  // read in the template
  return mkdir(dirPath).then(() =>
    readFile("./scripts/post_template.md", "utf-8").then((raw) => {
      const populated = raw.replace("$1", title).replace("$2", description);
      return writeFile(filePath, populated);
    })
  );
};

const data = {
  title: "",
  description: "",
};

console.log("Creating a new post for you in content/post.");
console.log("First a few questions...");

new Promise((resolve) =>
  readline.question("What is the title? ", (title) => {
    data.title = title;
    resolve();
  })
)
  .then((slug) => {
    return new Promise((resolve) =>
      readline.question("What is the description? ", (description) => {
        data.description = description;
        resolve();
      })
    );
  })
  .then(() => createPost(data))
  .catch((err) => console.error("Unexpected error!", err))
  .finally(() => {
    readline.close();
  });
