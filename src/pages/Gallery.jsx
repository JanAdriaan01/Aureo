import React from "react";
import IMAGES from "../data/images"; // Your images object

export default function Gallery() {
  const imgs = [IMAGES.elite, IMAGES.swift38, IMAGES.edge42, IMAGES.sliding1000];
  return (
    <div>
      <h1 className="text-3xl font-bold">Gallery</h1>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {imgs.map((src, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-zinc-200 aspect-[4/3]">
            <img src={src} alt="Project" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}