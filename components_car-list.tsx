import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

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

export default function CarList({ onCarsLoaded }: { onCarsLoaded: (cars: Car[]) => void }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState("buick");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [mname, setMname] = useState("buick");
  const fetchCars = async () => {
    setIsLoading(true);
    setError(null);
      try {
            // Check if mname is empty
        const searchName = searchTerm.trim() === "" ? "amc" : searchTerm;
        const response = await fetch('http://127.0.0.1:5000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.result && data.result.success) {
        const parsedData = JSON.parse(data.result.success);
        const carArray = Array.isArray(parsedData) ? parsedData : [parsedData];
        setCars(carArray);
        onCarsLoaded(carArray);
      } else {
        throw new Error('No data received from the server');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCars(searchTerm);
  };

  useEffect(() => {
    fetchCars('');  // Initial fetch with empty search term
  }, []);

  if (error) {
    return (
      <Card className="w-[350px]">
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Car List</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
          <Input
            placeholder="Search cars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>
        <ScrollArea className="h-[400px]">
          {cars.map((car, index) => (
            <div key={index} className="mb-4 p-2 border rounded">
              <h3 className="font-bold">{car.Name}</h3>
              <p>Year: {car.Year}</p>
              <p>MPG: {car.Miles_per_Gallon !== null ? car.Miles_per_Gallon : 'N/A'}</p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

