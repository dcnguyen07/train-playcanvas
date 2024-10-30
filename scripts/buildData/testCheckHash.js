import { hashElement } from "folder-hash";

const options = {
  algo    : "md5",
  folders : { exclude: [".*", "node_modules", "test_coverage"] },
};

console.log("Creating a hash over the current folder:");
let start = performance.now();
let lastHash = "GWcDY7nN2SZFzdpQL98V4Q==";
hashElement("./assets/atlas", options)
  .then((hash) => {
    // console.log(hash.toString());
    let end = performance.now();
    console.log("Time to hash:", end - start, "ms");
    if (lastHash === hash.hash) {
      console.log("Hash is the same");
    }
    else {
      console.log("Hash is different", lastHash, hash.hash);
    }
  })
  .catch((error) => {
    return console.error("hashing failed:", error);
  });
