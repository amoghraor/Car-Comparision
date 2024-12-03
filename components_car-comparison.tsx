import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

interface CarComparisonProps {
  cars: Car[];
}

export default function CarComparison({ cars }: CarComparisonProps) {
  const [car1, setCar1] = useState<Car | null>(null);
  const [car2, setCar2] = useState<Car | null>(null);

  return (
    <Card className="w-[800px]">
      <CardHeader>
        <CardTitle>Car Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <Select onValueChange={(value) => setCar1(cars.find(car => car.Name === value) || null)}>
            <SelectTrigger className="w-[350px]">
              <SelectValue placeholder="Select first car" />
            </SelectTrigger>
            <SelectContent>
              {cars.map((car, index) => (
                <SelectItem key={index} value={car.Name}>{car.Name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setCar2(cars.find(car => car.Name === value) || null)}>
            <SelectTrigger className="w-[350px]">
              <SelectValue placeholder="Select second car" />
            </SelectTrigger>
            <SelectContent>
              {cars.map((car, index) => (
                <SelectItem key={index} value={car.Name}>{car.Name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {car1 && car2 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attribute</TableHead>
                <TableHead>{car1.Name}</TableHead>
                <TableHead>{car2.Name}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(car1).map((key) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{car1[key as keyof Car]}</TableCell>
                  <TableCell>{car2[key as keyof Car]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

