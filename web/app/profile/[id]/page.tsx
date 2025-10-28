"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Heart, 
  User, 
  BookOpen, 
  Calendar, 
  UserCircle, 
  MapPin, 
  Skull, 
  Building2, 
  Scale, 
  Briefcase,
  BarChart3,
  Image as ImageIcon
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMartyrsProfiles, type MartyrProfile } from "@/hooks/use-martyrs-profiles"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [member, setMember] = useState<MartyrProfile | null>(null)
  const [suggestion, setSuggestion] = useState("")
  const { martyrsProfiles, isLoading, error, toggleFavorite } = useMartyrsProfiles()

  useEffect(() => {
    const foundMember = martyrsProfiles.find(m => m.id === params.id)
    if (foundMember) {
      setMember(foundMember)
    }
  }, [params.id, martyrsProfiles])

  const handleSubmitSuggestion = () => {
    // Here you would typically send the suggestion to your backend
    console.log('Suggestion submitted:', suggestion)
    setSuggestion("")
  }

  const handleToggleFavorite = () => {
    if (member) {
      toggleFavorite(member.id)
      setMember(prev => prev ? { ...prev, favorite: !prev.favorite } : null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        <span className="ml-3 text-lg text-gray-600">Loading profile...</span>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error || 'Member not found'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Team
        </Button>

        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              <AvatarImage src={member.avatar} alt={member.name} className="object-contain" />
              <AvatarFallback className="text-4xl">{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute -top-2 -right-2 h-10 w-10 rounded-full bg-white shadow-md",
                member.favorite ? "text-green-500" : "text-gray-300"
              )}
              onClick={handleToggleFavorite}
            >
              <Heart className={cn("h-5 w-5", member.favorite ? "fill-green-500" : "")} />
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
        </div>

        {/* Profile Details */}
        <Card className="mb-8">
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="text-green-700">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <Label className="font-semibold text-gray-700">Name</Label>
                    </div>
                    <p className="text-gray-600 ml-11">{member.name}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <Label className="font-semibold text-gray-700">Bio</Label>
                    </div>
                    <p className="text-gray-600 ml-11">{member.bio}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <Label className="font-semibold text-gray-700">Date of Birth</Label>
                    </div>
                    <p className="text-gray-600 ml-11">{member.date_of_birth}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <UserCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <Label className="font-semibold text-gray-700">Gender</Label>
                    </div>
                    <p className="text-gray-600 ml-11">{member.gender}</p>
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <Label className="font-semibold text-gray-700">Location</Label>
                    </div>
                    <p className="text-gray-600 ml-11">{member.city}, {member.state}</p>
                  </div>
                </div>
              </div>

              {/* Death Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                  <Skull className="h-5 w-5" />
                  Death Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <Label className="font-semibold text-gray-700">Date of Death</Label>
                    </div>
                    <p className="text-gray-600 ml-11">{member.date_of_death}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Skull className="h-5 w-5 text-green-600" />
                      </div>
                      <Label className="font-semibold text-gray-700">Cause of Death</Label>
                    </div>
                    <p className="text-gray-600 ml-11">{member.cause_of_death}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Building2 className="h-5 w-5 text-green-600" />
                      </div>
                      <Label className="font-semibold text-gray-700">Place of Death</Label>
                    </div>
                    <p className="text-gray-600 ml-11">{member.place_of_death}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Scale className="h-5 w-5 text-green-600" />
                      </div>
                      <Label className="font-semibold text-gray-700">Death Responsibility</Label>
                    </div>
                    <p className="text-gray-600 ml-11">{member.death_responsibility}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Briefcase className="h-5 w-5 text-green-600" />
                      </div>
                      <Label className="font-semibold text-gray-700">Role</Label>
                    </div>
                    <p className="text-gray-600 ml-11">{member.role}</p>
                  </div>
                  {member.progress && (
                    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-green-600" />
                        </div>
                        <Label className="font-semibold text-gray-700">Progress</Label>
                      </div>
                      <div className="flex items-center space-x-2 ml-11">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all duration-300"
                            style={{ width: `${member.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{member.progress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {member.has_identified_ceasar_image && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5" />
                  Ceasar Image
                </h3>
                <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-200 transition-colors">
                  <img 
                    src={member.ceasar_image_url} 
                    alt="Ceasar Image" 
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggest Updates Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Suggest Updates
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suggest Updates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="suggestion">Your Suggestion</Label>
                <Textarea
                  id="suggestion"
                  placeholder="Enter your suggestion for profile updates..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button 
                onClick={handleSubmitSuggestion}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Submit Suggestion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 