import { Canvas } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { forwardRef } from "react";

function Character() {
  const { scene } = useGLTF("/models/character.glb");

  return (
    <primitive
      object={scene}
      position={[1.3, -1.2, 0]}
      rotation={[0, 0, 0]}
      scale={1.5}
    />
  );
}

useGLTF.preload("/models/character.glb");

const ARScene = forwardRef(function ARScene(_, ref) {
  return (
    <Canvas
      ref={ref}
      camera={{
        position: [0, 0, 5],
        fov: 45,
      }}
      gl={{
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
      <ambientLight intensity={1.5} />

      <directionalLight position={[5, 5, 5]} intensity={2} />

      <Environment preset="city" />

      <Character />
    </Canvas>
  );
});

export default ARScene;
