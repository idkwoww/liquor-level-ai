const URL = "model/"; // Model folder path
let model, webcam, labelContainer, maxPredictions;
let currentFacingMode = "user"; // default to front camera

// Initialize the model and webcam
async function init(facingMode = "user") {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // Load the model
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Setup webcam
  const flip = false;
  const constraints = {
    video: { facingMode: facingMode }
  };

  webcam = new tmImage.Webcam(400, 400, flip);
  await webcam.setup(constraints);
  await webcam.play();

  document.getElementById("webcam").srcObject = webcam.webcam;
  window.requestAnimationFrame(loop);

  // Setup label container
  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  prediction.sort((a, b) => b.probability - a.probability);

  const top = prediction[0];
  labelContainer.childNodes[0].innerHTML =
    `${top.className}: ${(top.probability * 100).toFixed(1)}%`;
}

// Switch camera button
document.getElementById("switchCamera").onclick = () => {
  const select = document.getElementById("cameraSelect");
  currentFacingMode = select.value;
  init(currentFacingMode);
};

// Reset button
document.getElementById("reset").onclick = () => {
  labelContainer.innerHTML = "Waiting for model...";
};

// Start with front camera
init("user");
