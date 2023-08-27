const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const ttf2woff = require("ttf2woff");
const { Path, Glyph, load } = require("opentype.js");

const { client } = require("../configs/vision.config");

exports.detectText = async (imageUrl) => {
  try {
    const matches = imageUrl.match(/^data:(.+);base64,(.+)$/);

    if (!matches) {
      throw new Error("Invalid data URL");
    }
    const buffer = Buffer.from(matches[2], "base64");

    const [result] = await client.documentTextDetection(buffer);
    const {
      fullTextAnnotation: { text },
    } = result;

    return text;
  } catch (err) {
    throw err;
  }
};

exports.convertPathToFontBuffer = async (unicodePaths) => {
  try {
    const resolvedPath = path.resolve(
      "src",
      "assets",
      "fonts",
      "NotoSans-Medium.otf"
    );
    const font = await load(resolvedPath);

    const glyphPaths = unicodePaths.map(({ unicode, pathString }) => {
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

    font.tables.name.fontFamily.en = "Test Sans Med";

    const buffer = Buffer.from(font.toArrayBuffer());

    return buffer;
  } catch (err) {
    throw err;
  }
};

exports.convertBufferToTtf = async (buffer) =>
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

exports.readFileToBuffer = async (filePath) => {
  try {
    const buffer = await fsPromises.readFile(filePath);

    return buffer;
  } catch (err) {
    throw err;
  }
};

exports.convertTtfToWoff = async (filePath) => {
  try {
    const ttf = await fsPromises.readFile(filePath);
    const woff = ttf2woff(ttf);

    return woff.buffer;
  } catch (err) {
    throw err;
  }
};
