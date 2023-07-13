import React from 'react';
import * as THREE from 'three';
import { Mesh, Scene } from "./types/three";
import { PerspectiveCamera, Main, LinkedLine } from '@ag-three/interaction';
// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  THREE,
  ...THREE,
  Mesh,
  Scene,
  PerspectiveCamera,
  Main,
  LinkedLine,
  
};
export default ReactLiveScope;
