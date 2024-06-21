
let video;
let poseNet;
let pose = [];
let canvas = null;
const colores = ["#ff0000aa", "#00ff00aa", "#0000ffaa"];
const precision = 0.7;
const margen = 100;
const grillaCapturas = document.querySelector(".grid");

const cuerpo = [
  { parte: "leftWrist", imagen: null},
  { parte: "rightWrist", imagen: null},
  { parte: "nose", imagen: null},
  { parte: "leftEye", imagen: null},
  { parte: "rightEye", imagen: null},
  { parte: "leftEar", imagen: null},
  { parte: "rightEar", imagen: null},
  { parte: "leftElbow", imagen: null},
  { parte: "rightElbow", imagen: null},
  // { parte: "leftHip", imagen: null},
  // { parte: "rightHip", imagen: null},
  // { parte: "leftKnee", imagen: null},
  // { parte: "rightKnee", imagen: null},
  // { parte: "leftAnkle", imagen: null},
  // { parte: "rightAnkle", imagen: null}
];
let imgsCuerpo = [];

let parteCuerpo = null;
let posicionParteCuerpo = {x: -100, y: -100}
let objetivo = null;

function preload() {
  // cargar imágenes
  cuerpo.forEach(function cargarImagen(parte) {
    parte.imagen = loadImage("img/" + parte.parte + ".png");
  });
}

function setup() {
  // flipped: true  espeja la imagen de camara 
  video = createCapture(VIDEO, { flipped: true });
  canvas = createCanvas(640, 480, document.querySelector("canvas"));
  video.size(width, height);
  
  rectMode(CENTER);
  imageMode(CENTER);
  objetivo = nuevoObjetivo();
  parteCuerpo = elegirElemento(cuerpo);

  // Posenet configurado para detectar 1 pose
  poseNet = ml5.poseNet(video, "single", function cargoModelo() {
    console.log("Ya cargo ML5 posenet");
  });

  // evento que reacciona a las poses
  poseNet.on('pose', function(results) {
    // console.log(results);
    pose = results[0];

    if (pose.pose[parteCuerpo.parte].confidence > precision ) {
      posicionParteCuerpo.x = width - pose.pose[parteCuerpo.parte].x;
      posicionParteCuerpo.y = pose.pose[parteCuerpo.parte].y;
    };
  });
  
  video.hide();
}

function elegirElemento(lista) {
  return lista[Math.floor(Math.random()*lista.length)];
}

function nuevoObjetivo() {
  return {
    x: random(margen, width - margen),
    y: random(margen, height - margen)
  }
}

function draw() {
  image(video, width/2, height/2, width, height);

  if (dist(objetivo.x, objetivo.y, posicionParteCuerpo.x, posicionParteCuerpo.y) < 80) { 
    objetivo = nuevoObjetivo();
    parteCuerpo = elegirElemento(cuerpo);
    // tomamos captura del canvas
    const captura = canvas.elt.toDataURL();
    // agregamos <div> con la imagen al DOM
    crearImagen(grillaCapturas, captura);
  }

  noFill();
  strokeWeight(random(1, 3));
  stroke(random(colores));
  circle(objetivo.x + random(-5, 5), objetivo.y + random(-5, 5), random(30, 50));
  
  if (pose.pose && pose.pose[parteCuerpo.parte].confidence > precision ) {
    image(parteCuerpo.imagen, posicionParteCuerpo.x, posicionParteCuerpo.y, 100, 100);
  }
}

function crearImagen(grilla, src) {
  const div = document.createElement("div");
  div.className = "obra";
  const img = document.createElement("img");
  img.src = src;
  div.append(img);
  grilla.append(div);
}