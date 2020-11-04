const image = document.getElementById("preview");
const labelContainer = document.getElementById("label-container");
const input = document.getElementById("image_uploads");
const button = document.getElementById("submit");

const writeToContainer = (container, content) => {
  container.innerHTML = content;
};

input.addEventListener("change", (e) => {
  image.src = URL.createObjectURL(e.target.files[0]);
  writeToContainer(labelContainer, "");
});

const findBest = (array) => {
  array.sort((a, b) => b.probability - a.probability);
  return array[0];
};

const predict = async (url) => {
  const modelURL = url + "model.json";
  const metadataURL = url + "metadata.json";
  const model = await tmImage.load(modelURL, metadataURL);
  const prediction = await model.predict(image);
  const best = findBest(prediction);
  return { best, prediction };
};

const confidenceDictionary = (confidence) => {
  if (confidence >= 0.8) return "is";
  if (confidence >= 0.6) return "is likely";
  else return "could be";
};

button.addEventListener("click", async () => {
  writeToContainer(labelContainer, "<div>I'm thinking...<div/>");

  const maleFemaleModel = await predict(
    "https://teachablemachine.withgoogle.com/models/tRT8Cg4wi/"
  );
  const headwearWithoutModel = await predict(
    "https://teachablemachine.withgoogle.com/models/iaTEnc3Ny/"
  );
  const shortLongModel = await predict(
    "https://teachablemachine.withgoogle.com/models/EK-CIdp2W/"
  );

  const promises = [maleFemaleModel, headwearWithoutModel, shortLongModel];

  Promise.all(promises).then((values) => {
    let text = "";
    //// Debug
    console.log(values)
    ////
    values.map((value) => {
      const { probability, className } = value.best;
      text += `<p>Subject ${confidenceDictionary(
        probability.toFixed(2)
      )} ${className} (${probability.toFixed(2) * 100}%) .</p>`;
    });
    writeToContainer(labelContainer, text);
  });
});
