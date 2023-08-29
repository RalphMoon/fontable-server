const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const ttf2woff = require("ttf2woff");
const { Path, Glyph, Font } = require("opentype.js");

const convertPathToOtfBuffer = async (name, unicodePaths) => {
  try {
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

    const font = new Font({
      familyName: name,
      styleName: "Medium",
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      glyphs,
    });

    const buffer = Buffer.from(font.toArrayBuffer());

    return buffer;
  } catch (err) {
    throw err;
  }
};

const convertBufferToTtf = async (buffer) =>
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

const readFileToBuffer = async (filePath) => {
  try {
    const buffer = await fsPromises.readFile(filePath);

    return buffer;
  } catch (err) {
    throw err;
  }
};

const convertTtfToWoff = async (filePath) => {
  try {
    const ttf = await fsPromises.readFile(filePath);
    const woff = ttf2woff(ttf);

    return woff.buffer;
  } catch (err) {
    throw err;
  }
};

exports.getBufferByFontType = async (name, unicodePaths, fontType) => {
  try {
    let buffer = await convertPathToOtfBuffer(name, unicodePaths);

    if (fontType === "ttf") {
      const filePath = await convertBufferToTtf(buffer);

      buffer = await readFileToBuffer(filePath);
      fs.unlinkSync(filePath);
    } else if (fontType === "woff") {
      const filePath = await convertBufferToTtf(buffer);

      buffer = await convertTtfToWoff(filePath);
      fs.unlinkSync(filePath);
    }

    return buffer;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
