'use client'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Raycaster, Vector2, Mesh, CircleGeometry, MeshBasicMaterial } from 'three';
import fontJson from 'three/examples/fonts/helvetiker_regular.typeface.json';
import axios from 'axios';
import { data } from '../../data';
import { GUI } from 'dat.gui';



export default function Home() {

  const [products, setProducts] = useState()
  const [controlsEnabled, setControlsEnabled] = useState(true);

  
  const [hoveredProduct, setHoveredProduct] = useState(null);


 


  const mountRef = useRef(null);

  useEffect(() => {
   
    const scene = new THREE.Scene();

    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.x = 5;
    camera.position.y = 10

   
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);
   

    
    const exrLoader = new EXRLoader();
    exrLoader.load('https://centeralrepobucket.s3.ap-south-1.amazonaws.com/venice_sunset_4k+(2).exr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.background = texture;

      

      const loader = new GLTFLoader();
      loader.load('https://centeralrepobucket.s3.ap-south-1.amazonaws.com/drift_race_track_free.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);  
        scene.add(model);
        animate();  
      }, undefined, (error) => {
        console.error(error);
      });
    });


    const font = new FontLoader().parse(fontJson);

    const radius = 10;
      const geometry = new CircleGeometry(1, 32);
      
      data.forEach((product, index) => {
        const angle = index * (Math.PI * 2 / data.length);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const circleMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
        const circleMesh = new Mesh(geometry, circleMaterial);
        circleMesh.position.set(x, y, 0); 
        circleMesh.userData = { product, index };
        scene.add(circleMesh);

        // Add product number text
        const textGeometry = new TextGeometry(`${index + 1}`, {
          font: font,
          size: 0.5,
          height: 0.1
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(circleMesh.position.x - 0.3, circleMesh.position.y - 0.3, circleMesh.position.z);
        scene.add(textMesh);
      });

      // Set up raycaster for hover detection
      const raycaster = new Raycaster();
      const mouse = new Vector2();

      const onMouseMove = (event) => {
        // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

     
        raycaster.ray.origin.copy(camera.position);
        raycaster.ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(raycaster.ray.origin).normalize();


        // Check for intersections
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;
          setHoveredProduct(intersectedObject.userData.product);
        } else {
          setHoveredProduct(null);
        }
      };

      window.addEventListener('mousemove', onMouseMove);

       const gui = new GUI();
      const controlOptions = { 'Enable Controls': controlsEnabled };

      gui.add(controlOptions, 'Enable Controls').onChange(value => {
        setControlsEnabled(value);
        if (value) {
          controls.enabled = true;
        } else {
          controls.enabled = false;
        }
      });

      const animate = () => {
        requestAnimationFrame(animate);
        if (controlsEnabled) {
          controls.update();
        }
        renderer.render(scene, camera);
      };
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

   
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [controlsEnabled]);



  return (
    <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} >
      {hoveredProduct && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }}>
          <h3>{hoveredProduct.title}</h3>
          <p>{hoveredProduct.description}</p>
          <p>Price: ${hoveredProduct.price}</p>
          <p>Rating: {hoveredProduct.rating.rate} ({hoveredProduct.rating.count} reviews)</p>
        </div>
      )}

        </div>
  );
}
