import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/landing/Navigation";
import {
  Upload,
  User,
  AtSign,
  Mail,
  Phone,
  MapPin,
  Clock,
  Leaf,
  CloudSun,
  Ruler,
  List,
  Target,
  Camera,
  Save,
  ArrowLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { CheckedState } from "@radix-ui/react-checkbox";

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [isSaving, setIsSaving] = useState(false);

  const [personalInfo, setPersonalInfo] = useState(() => {
    const savedInfo = localStorage.getItem("userPersonalInfo");
    return savedInfo
      ? JSON.parse(savedInfo)
      : {
          fullName: "John Doe",
          username: "johndoe",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
          location: "New Delhi, India",
          timeZone: "Asia/Kolkata",
        };
  });

  const [gardeningPrefs, setGardeningPrefs] = useState(() => {
    const savedPrefs = localStorage.getItem("userGardeningPrefs");
    return savedPrefs
      ? JSON.parse(savedPrefs)
      : {
          level: "intermediate",
          units: "metric",
          goals: "hobbyist",
          climateZone: "9a",
        };
  });

  const [plantTypes, setPlantTypes] = useState(() => {
    const savedTypes = localStorage.getItem("userPlantTypes");
    return savedTypes
      ? JSON.parse(savedTypes)
      : {
          indoor: true,
          outdoor: true,
          hydroponic: false,
          succulents: true,
          herbs: true,
          vegetables: true,
          fruits: false,
          flowering: true,
          tropical: false,
          cacti: true,
        };
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("userWishlist");
    return savedWishlist
      ? JSON.parse(savedWishlist)
      : ["Monstera Deliciosa", "Snake Plant", "Fiddle Leaf Fig"];
  });
  const [newWishItem, setNewWishItem] = useState("");

  const personalForm = useForm();
  const gardeningForm = useForm();

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlantTypeChange = (plantType: string, value: CheckedState) => {
    setPlantTypes((prev) => ({ ...prev, [plantType]: value }));
  };

  const addToWishlist = () => {
    if (newWishItem.trim()) {
      setWishlist((prev) => [...prev, newWishItem.trim()]);
      setNewWishItem("");
      toast.success("Plant added to wishlist");
    }
  };

  const removeFromWishlist = (index: number) => {
    setWishlist((prev) => prev.filter((_, i) => i !== index));
    toast.success("Plant removed from wishlist");
  };

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      localStorage.setItem("userPersonalInfo", JSON.stringify(personalInfo));
      setIsSaving(false);
      toast.success("Personal information saved successfully");
    }, 500);
  };

  const handleGardeningPrefsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      localStorage.setItem(
        "userGardeningPrefs",
        JSON.stringify(gardeningPrefs)
      );
      localStorage.setItem("userPlantTypes", JSON.stringify(plantTypes));
      localStorage.setItem("userWishlist", JSON.stringify(wishlist));
      setIsSaving(false);
      toast.success("Gardening preferences saved successfully");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navigation />
      <div className="pt-20 pb-10 px-4 max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">User Profile</h1>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>
                    {personalInfo.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold">{personalInfo.fullName}</h2>
              <p className="text-gray-500 text-sm">@{personalInfo.username}</p>
              <p className="text-green-600 font-medium mt-2">
                {gardeningPrefs.level.charAt(0).toUpperCase() +
                  gardeningPrefs.level.slice(1)}{" "}
                Gardener
              </p>
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {Object.entries(plantTypes)
                  .filter(([_, checked]) => checked)
                  .slice(0, 3)
                  .map(([type]) => (
                    <span
                      key={type}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium mb-3">Profile Completion</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">85% complete</p>
              <p className="text-xs text-gray-500 mt-1">
                Add a phone number to complete your profile
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <Leaf className="mr-2 h-4 w-4" />
                  <span>View My Garden</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <List className="mr-2 h-4 w-4" />
                  <span>My Plant List</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <Target className="mr-2 h-4 w-4" />
                  <span>Garden Goals</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Tabs
              defaultValue="personal"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full border-b rounded-none bg-white p-0">
                <TabsTrigger
                  value="personal"
                  className="flex-1 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Personal Information
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="flex-1 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Gardening Preferences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="p-6">
                <Form {...personalForm}>
                  <form
                    onSubmit={handlePersonalInfoSubmit}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          <User className="h-4 w-4 inline mr-1" /> Full Name
                        </label>
                        <Input
                          name="fullName"
                          value={personalInfo.fullName}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          <AtSign className="h-4 w-4 inline mr-1" /> Username
                        </label>
                        <Input
                          name="username"
                          value={personalInfo.username}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          <Mail className="h-4 w-4 inline mr-1" /> Email Address
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={personalInfo.email}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          <Phone className="h-4 w-4 inline mr-1" /> Phone Number
                          (Optional)
                        </label>
                        <Input
                          name="phone"
                          value={personalInfo.phone}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          <MapPin className="h-4 w-4 inline mr-1" /> Location
                          (Optional)
                        </label>
                        <Input
                          name="location"
                          value={personalInfo.location}
                          onChange={handlePersonalInfoChange}
                          placeholder="City, Country"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          <Clock className="h-4 w-4 inline mr-1" /> Time Zone
                        </label>
                        <Select
                          value={personalInfo.timeZone}
                          onValueChange={(value) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              timeZone: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timezone" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="Asia/Kolkata">
                              Asia/Kolkata (IST)
                            </SelectItem>
                            <SelectItem value="America/New_York">
                              America/New York (EST)
                            </SelectItem>
                            <SelectItem value="Europe/London">
                              Europe/London (GMT)
                            </SelectItem>
                            <SelectItem value="Australia/Sydney">
                              Australia/Sydney (AEST)
                            </SelectItem>
                            <SelectItem value="Pacific/Auckland">
                              Pacific/Auckland (NZST)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button type="submit" className="mt-4" disabled={isSaving}>
                      {isSaving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Personal Information
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="preferences" className="p-6">
                <Form {...gardeningForm}>
                  <form
                    onSubmit={handleGardeningPrefsSubmit}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        <Leaf className="h-4 w-4 inline mr-1" /> Gardening Level
                      </label>
                      <Select
                        value={gardeningPrefs.level}
                        onValueChange={(value) =>
                          setGardeningPrefs((prev) => ({
                            ...prev,
                            level: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        <Leaf className="h-4 w-4 inline mr-1" /> Favorite Plant
                        Types
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {Object.entries(plantTypes).map(([type, checked]) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`type-${type}`}
                              checked={checked}
                              onCheckedChange={(value: CheckedState) =>
                                handlePlantTypeChange(type, value === true)
                              }
                            />
                            <label
                              htmlFor={`type-${type}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        <CloudSun className="h-4 w-4 inline mr-1" /> Climate
                        Zone
                      </label>
                      <Select
                        value={gardeningPrefs.climateZone}
                        onValueChange={(value) =>
                          setGardeningPrefs((prev) => ({
                            ...prev,
                            climateZone: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your climate zone" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="1a">
                            Zone 1a (Below -50°F/-45.6°C)
                          </SelectItem>
                          <SelectItem value="3b">
                            Zone 3b (-35 to -30°F/-37.2 to -34.4°C)
                          </SelectItem>
                          <SelectItem value="5a">
                            Zone 5a (-20 to -15°F/-28.9 to -26.1°C)
                          </SelectItem>
                          <SelectItem value="7b">
                            Zone 7b (5 to 10°F/-15 to -12.2°C)
                          </SelectItem>
                          <SelectItem value="9a">
                            Zone 9a (20 to 25°F/-6.7 to -3.9°C)
                          </SelectItem>
                          <SelectItem value="11a">
                            Zone 11a (40 to 45°F/4.4 to 7.2°C)
                          </SelectItem>
                          <SelectItem value="13b">
                            Zone 13b (Above 65°F/18.3°C)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        <Ruler className="h-4 w-4 inline mr-1" /> Preferred
                        Units
                      </label>
                      <Select
                        value={gardeningPrefs.units}
                        onValueChange={(value) =>
                          setGardeningPrefs((prev) => ({
                            ...prev,
                            units: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select units" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="metric">
                            Metric (cm, ml, °C)
                          </SelectItem>
                          <SelectItem value="imperial">
                            Imperial (in, oz, °F)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        <List className="h-4 w-4 inline mr-1" /> Plant Wishlist
                      </label>
                      <div className="flex mt-2">
                        <Input
                          value={newWishItem}
                          onChange={(e) => setNewWishItem(e.target.value)}
                          placeholder="Enter plant name"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addToWishlist}
                          variant="secondary"
                          className="ml-2"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="mt-2">
                        {wishlist.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No plants in wishlist yet.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {wishlist.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-center justify-between bg-neutral-50 p-2 rounded"
                              >
                                <span>{item}</span>
                                <Button
                                  type="button"
                                  onClick={() => removeFromWishlist(index)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  Remove
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        <Target className="h-4 w-4 inline mr-1" /> Gardening
                        Goals
                      </label>
                      <Select
                        value={gardeningPrefs.goals}
                        onValueChange={(value) =>
                          setGardeningPrefs((prev) => ({
                            ...prev,
                            goals: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your goals" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="casual">
                            Casual (Low maintenance plants)
                          </SelectItem>
                          <SelectItem value="hobbyist">
                            Hobbyist (Regular gardening)
                          </SelectItem>
                          <SelectItem value="urban">
                            Urban Gardening (Small space solutions)
                          </SelectItem>
                          <SelectItem value="commercial">
                            Commercial (Selling produce/plants)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="mt-4" disabled={isSaving}>
                      {isSaving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Gardening Preferences
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
