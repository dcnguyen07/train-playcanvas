import { hashElement } from "folder-hash";


/**
 * @summary clean file path: remove ../ and replace \ to /
 * @param {string} path
 * @returns {string} cleaned path
 */
export function cleanPath(path) {
  return path.replace(/\\/g, "/");
}


export async function checkFolderHash(folderPath, hash) {
  let hashFolder = await hashElement(folderPath);
  return hashFolder.hash === hash;
}
