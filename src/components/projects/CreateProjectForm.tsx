"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { State, City } from "country-state-city";

interface CreateProjectFormProps {
  onBack: () => void;
  onCreateProject: (data: {
    projectName: string;
    clientName: string;
    projectType: string;
    state: string;
    city: string;
  }) => void;
}

type StateType = {
  name: string;
  isoCode: string;
  countryCode: string;
};

type CityType = {
  name: string;
  countryCode: string;
  stateCode: string;
};

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  onBack,
  onCreateProject,
}) => {
  // Separate state for each input
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [cityValue, setCityValue] = useState("");

  const [states, setStates] = useState<StateType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);

  useEffect(() => {
    const usStates = State.getStatesOfCountry("US");
    setStates(usStates);
  }, []);

  const handleStateChange = (isoCode: string) => {
    const selectedState = states.find((s) => s.isoCode === isoCode);
    if (selectedState) {
      const stateCities = City.getCitiesOfState("US", selectedState.isoCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
    setStateValue(isoCode); // store short code
    setCityValue(""); // reset city
  };

  const handleCityChange = (cityName: string) => {
    setCityValue(cityName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onCreateProject({
      projectName,
      clientName,
      projectType,
      state: stateValue,
      city: cityValue,
    });
  };
  return (
    <div className="h-full w-full flex items-center justify-center bg-white p-4">
      <div className="bg-white border rounded-lg p-8 w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-2 text-gray-700 cursor-pointer border"
          onClick={onBack}
        >
          <ArrowLeft size={18} /> Back
        </Button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Create Project
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 space-y-1">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="mb-4 space-y-1">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name"
              required
            />
          </div>

          <div className="mb-4 space-y-1">
            <Label htmlFor="projectType">Project Type</Label>
            <Input
              id="projectType"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              placeholder="Enter project type"
              required
            />
          </div>

          {/* State Select */}
          <div className="mb-4 space-y-1 w-full">
            <Label htmlFor="state">State</Label>
            <Select value={stateValue} onValueChange={handleStateChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.isoCode} value={state.isoCode}>
                    {state.name} {/* show full name to user */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Select */}
          <div className="mb-6 space-y-1">
            <Label htmlFor="city">City</Label>
            <Select
              value={cityValue}
              onValueChange={handleCityChange}
              disabled={!stateValue}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-[#00332A]">
            Create Project
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectForm;
