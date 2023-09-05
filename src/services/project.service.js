const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const { Path, Glyph, load } = require("opentype.js");

const convertPathToOtfBuffer = async (name, unicodePaths) => {
  try {
    const resolvedPath = path.resolve(
      "src",
      "assets",
      "fonts",
      "NotoSans-Medium.otf"
    );
    const font = await load(resolvedPath);

    const glyphPaths = unicodePaths
      .filter(({ paths }) => !!paths[0])
      .map(({ unicode, paths, advanceWidth }) => {
        const glyphPath = new Path();

        paths.forEach((coordinates) => {
          const [start, ...rest] = coordinates.map(([x, y]) => [
            3.3 * x,
            698 - 1.745 * y,
          ]);

          glyphPath.moveTo(...start);

          for (let i = 0; i < rest.length - 1; i += 1) {
            const firstCommandPoint = rest[i];
            const secondCommandPoint = rest[i + 1] || firstCommandPoint;

            glyphPath.quadraticCurveTo(
              ...firstCommandPoint,
              ...secondCommandPoint
            );
          }

          for (let i = rest.length - 1; i >= 0; i -= 1) {
            const reversedFirstControlPoint = rest[i];
            const reversedSecondControlPoint = rest[i - 1] || start;

            glyphPath.quadraticCurveTo(
              ...reversedFirstControlPoint,
              ...reversedSecondControlPoint
            );
          }
        });

        return { unicode, glyphPath, advanceWidth };
      });

    const glyphs = glyphPaths.map(({ unicode, glyphPath, advanceWidth }) => {
      const glyph = new Glyph({
        name: String.fromCharCode(unicode),
        unicode,
        path: glyphPath,
        advanceWidth,
      });

      return glyph;
    });

    glyphs.forEach((glyph) => {
      const glyphIndex = font.charToGlyphIndex(glyph.name);

      font.glyphs[glyphIndex] = glyph;
      font.glyphs.glyphs[glyphIndex] = glyph;
    });

    font.tables.name.fontFamily.en = name;
    font.names.fontFamily.en = name;
    font.names.fullName.en = name;
    font.names.preferredFamily.en = name;
    font.names.postScriptName.en = name;

    const otfBuffer = Buffer.from(font.toArrayBuffer());

    return otfBuffer;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const convertOtfBufferToTtfFile = (buffer) =>
  new Promise((resolve, reject) => {
    const tempFilePath = path.resolve("src", "assets", "fonts", "TestSans.ttf");
    fs.writeFile(tempFilePath, buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(tempFilePath);
      }
    });
  });

const readTempFileToBufferAndDelete = async (filePath) => {
  try {
    const buffer = await fsPromises.readFile(filePath);

    fs.unlinkSync(filePath);
    return buffer;
  } catch (err) {
    throw err;
  }
};

const convertOtfBufferToTtfBuffer = async (buffer) => {
  const ttfTempFile = await convertOtfBufferToTtfFile(buffer);
  const ttfBuffer = await readTempFileToBufferAndDelete(ttfTempFile);

  return ttfBuffer;
};

const appendFontBufferToEachProject = async (projects) => {
  try {
    const clonedProjects = JSON.parse(JSON.stringify(projects));
    const bufferPromises = [];

    projects.forEach(async ({ name, unicodePaths }) => {
      const bufferPromise = convertPathToOtfBuffer(name, unicodePaths);

      bufferPromises.push(bufferPromise);
    });

    const otfBuffers = await Promise.all(bufferPromises);

    for (let i = 0; i < clonedProjects.length - 1; i += 1) {
      clonedProjects[i].file = otfBuffers[i];
    }

    return clonedProjects;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = {
  convertPathToOtfBuffer,
  convertOtfBufferToTtfBuffer,
  appendFontBufferToEachProject,
};
