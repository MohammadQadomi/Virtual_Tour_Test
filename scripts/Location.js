import * as PANOLENS from '../../node_modules/panolens/build/panolens.module.js';
import * as THREE from "./three.module.js";

class Location{
    constructor(id, imagePath, voiceOverPath, arrows, hotspots, start=false, tourID){
        this.id = id;
        this.imagePath = imagePath;
        this.voiceOverPath = voiceOverPath;
        this.arrows = arrows;
        this.hotspots = hotspots;
        this.start = start;
        this.tourID = tourID;

        // this.panorama = new PANOLENS.ImagePanorama();
        this.panorama;
        this.imageHighQuality = null;
        this.imageLowQuality = null;

        this.overlayNumber = null;
    }

    AddPanoramaImage(img){
        this.panorama = new PANOLENS.ImagePanorama(img);
    }
    SetImageLowQuality(img){
        this.imageLowQuality = img;
    }
    SetImageHighQuality(img){
        this.imageHighQuality = img;
    }

    SetOverlayNumberObject(overlayNumberObject){
        this.overlayNumber = overlayNumberObject;
    }

    SetOverlayNumberColor(color){
        this.overlayNumber.style.backgroundColor = color;
    }
}

class Arrow{
    constructor(id, imagePath ="", title ="", position, rotation, scale = 300, location, destination, color = 'ffffff', /*titleColor = '#ffffff',*/ animated = false){
        this.id = id;
        this.imagePath = imagePath;
        this.title = title;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.location = location;
        this.destination = destination;

        // this.infospot = new PANOLENS.Infospot(scale, imagePath, animated);
        
        this.color = color;
        //this.titleColor = titleColor;
    }
    
    toString(){
        return `id: ${this.id}, image source: ${this.imagePath}, title: ${this.title}, position: ${this.position.x}_${this.position.y}_${this.position.z}, rotation: ${this.rotation}, scale: ${this.scale}, locationId: ${this.location}, destinationId: ${this.destination}`;
    }

    applyColor(){
        let tempColor = new THREE.Color(`#${this.color}`);
        this.infospot.material.color = tempColor;
    }

    applyTitleColor(){
        // this.infospot.element.style.color = this.titleColor;
    }

    applyFontScale(){
        this.infospot.element.style.fontSize = `${this.scale/10}px`; // Setting font size

        // control hover text height
        // let verticalData = 0.085;
        let verticalData = 0.26;
        this.infospot.element.verticalDelta = this.scale * verticalData;
    }
}

class Hotspot{
    constructor(id, imagePath , title ="", description, position, rotation, scale = 300, location, color = 'ffffff', titleColor = 'ffffff'){
        this.id = id;
        this.imagePath = imagePath;
        this.title = title;
        this.description = description;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.location = location;

        this.infospot = new PANOLENS.Infospot(scale, imagePath, false);

        this.color = color;
        this.titleColor = `${titleColor}`;
    }
    
    toString(){
        return `id: ${this.id}, image source: ${this.imagePath}, title: ${this.title}, description: ${this.description}, position: ${this.position.x}_${this.position.y}_${this.position.z}, rotation: ${this.rotation}, scale: ${this.scale}, locationId: ${this.location}, color: ${this.color}, title color: ${this.titleColor}`;
    }

    applyColor(){
        let tempColor = new THREE.Color(`#${this.color}`);
        this.infospot.material.color = tempColor;

        // this.infospot.dispatchEvent("onClick");
        // this.infospot.lockHoverElement();
    }

    applyTitleColor(){
        this.infospot.element.style.color = `#${this.titleColor}`;
    }

    applyFontScale(){
        this.infospot.element.style.fontSize = `${this.scale/10}px`; // Setting font size
        
        // control hover text height
        let verticalData = 0.25;
        this.infospot.element.verticalDelta = this.scale * verticalData;
    }
}

class ImageStorage {
    constructor() {
      this.images = {};
    }
  
    addImage(name, url) {
      const img = new Image();
      img.src = url;
      this.images[name] = img;
    }
  
    getImage(name) {
      return this.images[name] || null;
    }
  
    // list all image names
    listImages() {
      return Object.keys(this.images);
    }
  
    // remove image by name
    removeImage(name) {
      if (this.images[name]) {
        // console.log(`Delete image with name ${name}`);
        delete this.images[name];
      } else {
        // console.log(`Image with name ${name} does not exist.`);
      }
    }
}

export {Location, Arrow, Hotspot, ImageStorage};