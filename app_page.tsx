'use client'

import React, { useState, useEffect } from 'react';
import CarList from '../components/car-list';
import CarComparison from '../components/car-comparison';

interface Car {
  Name: string;
  Miles_per_Gallon: number;
  Cylinders: number;
  Displacement: number;
  Horsepower: number;
  Weight_in_lbs: number;
  Acceleration: number;
  Year: string;
  Origin: string;
}

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    // In a real application, you would fetch this data from your backend
    fetch('C:\Users\amogh\Downloads\cars.json')
      .then(response => response.json())
      .then(data => setCars(data));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Car Comparison Tool</h1>
      <div className="flex space-x-8">
        <CarList />
        <CarComparison cars={cars} />
      </div>
    </main>
  );
}

