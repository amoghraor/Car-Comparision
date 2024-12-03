'use client'

import React, { useState } from 'react';
import CarList from '../components/car-list';
import CarComparison from '../components/car-comparison';

interface Car {
  Name: string;
  Miles_per_Gallon: number | null;
  Cylinders: number;
  Displacement: number;
  Horsepower: number | null;
  Weight_in_lbs: number;
  Acceleration: number;
  Year: string;
  Origin: string;
}

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);

  const handleCarsLoaded = (loadedCars: Car[]) => {
    setCars(loadedCars);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Car Comparison Tool</h1>
      <div className="flex space-x-8">
        <CarList onCarsLoaded={handleCarsLoaded} />
        <CarComparison cars={cars} />
      </div>
    </main>
  );
}

