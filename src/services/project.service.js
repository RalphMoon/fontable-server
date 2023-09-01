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
      .filter(({ pathString }) => !!pathString)
      .map(({ unicode, pathString }) => {
        const glyphPath = new Path();

        const directions = pathString
          .split("M")
          .slice(1)
          .map((stroke) => stroke.trim().split(" Q "));

        const points = directions.map((direction) =>
          direction.map((coordinates) => {
            const positions = coordinates.split(" ");

            return positions.map((position, index) => {
              if (index % 2 !== 0) {
                return 800 - parseFloat(position);
              }

              return parseFloat(position);
            });
          })
        );

        points.forEach((direction) => {
          const [movePoint, ...qCurvePoints] = direction;

          glyphPath.moveTo(...movePoint);

          qCurvePoints.forEach((qCurvePoint) => {
            glyphPath.quadraticCurveTo(...qCurvePoint);
          });
        });

        return { unicode, glyphPath };
      });

    const glyphs = glyphPaths.map(({ unicode, glyphPath }) => {
      const glyph = new Glyph({
        name: String.fromCharCode(unicode),
        unicode,
        path: glyphPath,
        xMin: 100,
        xMax: 300,
        yMin: 100,
        yMax: 300,
        advanceWidth: 300,
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

module.exports = {
  convertPathToOtfBuffer,
  convertOtfBufferToTtfBuffer,
};
