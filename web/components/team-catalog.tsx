"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Heart, MoreHorizontal, Grid, List, Home, MessageSquare, Image, Users, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMartyrsProfiles, type MartyrProfile } from "../hooks/use-martyrs-profiles"

export default function TeamCatalog() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterValue, setFilterValue] = useState<"all" | "my-team">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { martyrsProfiles, isLoading, error, toggleFavorite } = useMartyrsProfiles()

  const handleMemberClick = (e: React.MouseEvent, memberId: string) => {
    // Prevent navigation if clicking on favorite button or more options
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/profile/${memberId}`)
  }

  const filteredMembers = martyrsProfiles.filter((profile: MartyrProfile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.role.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterValue === "my-team") {
      return matchesSearch && profile.favorite
    }

    return matchesSearch
  })

  return (
    <div className="flex min-h-screen relative">
      {/* Background gradient and birds */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgb(10_151_104)] from-20% via-white/20 via-50% to-black/70 to-80%" />
      
      {/* birds flock image */}
      <div className="absolute inset-0 z-10" style={{
        backgroundImage: `url("/birds-flock5.png")`,
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        opacity: 0.15,
      }} />

      {/* Sidebar */}
      <div className="hidden md:flex flex-col items-center w-16 bg-black py-6 space-y-8 group/sidebar-wrapper border-r border-white/10 relative z-30">
        {/* Sidebar Texture */}
        <div className="absolute inset-0 opacity-5" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '6px 6px'
        }}></div>
        <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg relative">
          <Users className="w-6 h-6 text-white" />
        </div>
        <nav className="flex flex-col items-center space-y-6">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
            <Home className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Users className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
            <MessageSquare className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
            <Image className="w-6 h-6" />
          </Button>
        </nav>
        <div className="mt-auto flex flex-col items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
            <Settings className="w-6 h-6" />
          </Button>
          <div className="flex flex-col items-center relative">
            <Avatar className="h-10 w-10 border-2 border-white/10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback className="bg-black text-white">AD</AvatarFallback>
            </Avatar>
            <div className="hidden group-hover/sidebar-wrapper:block absolute left-16 bg-black text-white text-xs p-2 rounded whitespace-nowrap z-20">
              Adison Hickman
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 relative z-10">
        <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border-none">
          {/* Header with Texture */}
          <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 border-b border-black/10 bg-black text-white relative">
            <div className="absolute inset-0 opacity-5" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='6' cy='6' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '12px 12px'
            }}></div>
            <div className="flex items-center mb-4 md:mb-0">
              <h1 className="text-xl md:text-2xl font-bold text-white">DresdenTeam</h1>
              <div className="hidden md:flex ml-8 items-center gap-2 w-full max-w-3xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                  <Input
                    className="pl-10 w-full bg-white/10 border-white/10 text-white placeholder:text-white/50"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] bg-white/10 border-white/10 text-white">
                    <SelectValue placeholder="Profession" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white border-white/10">
                    <SelectItem value="all">All Professions</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="writer">Writer</SelectItem>
                    <SelectItem value="engineer">Engineer</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] bg-white/10 border-white/10 text-white">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white border-white/10">
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="newyork">New York</SelectItem>
                    <SelectItem value="sanfrancisco">San Francisco</SelectItem>
                    <SelectItem value="london">London</SelectItem>
                    <SelectItem value="berlin">Berlin</SelectItem>
                    <SelectItem value="tokyo">Tokyo</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div></div>
          </div>

          {/* Team Members Section */}
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div className="flex items-center mb-4 md:mb-0">
                <Users className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold">Team Members</h2>
                <span className="ml-2 text-sm text-gray-500">Dresden</span>
              </div>

              <div className="flex flex-col sm:flex-row w-full md:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex flex-col gap-2 md:hidden w-full">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      className="pl-10 w-full bg-gray-50"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Profession" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Professions</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="writer">Writer</SelectItem>
                        <SelectItem value="engineer">Engineer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="newyork">New York</SelectItem>
                        <SelectItem value="sanfrancisco">San Francisco</SelectItem>
                        <SelectItem value="london">London</SelectItem>
                        <SelectItem value="berlin">Berlin</SelectItem>
                        <SelectItem value="tokyo">Tokyo</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Tabs
                    defaultValue="all"
                    className="w-full sm:w-auto"
                    onValueChange={(value) => setFilterValue(value as "all" | "my-team")}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="my-team">My Team</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="hidden md:flex border rounded-md overflow-hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-none px-3 py-1",
                        viewMode === "grid" ? "bg-green-50 text-green-600" : "bg-transparent",
                      )}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-none px-3 py-1",
                        viewMode === "list" ? "bg-green-50 text-green-600" : "bg-transparent",
                      )}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                <span className="ml-3 text-lg text-gray-600">Loading team members...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-8">
                <div className="rounded-lg bg-red-50 p-4 text-red-800">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                  <button 
                    className="mt-3 rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800 hover:bg-red-200"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-4",
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1",
                )}
              >
                {filteredMembers.map((member: MartyrProfile) => (
                  <div
                    key={member.id}
                    className={cn(
                      "bg-white border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer",
                      viewMode === "list" ? "flex items-center" : "flex flex-col items-center p-6",
                    )}
                    onClick={(e) => handleMemberClick(e, member.id)}
                  >
                    {viewMode === "list" ? (
                      <div className="flex items-center w-full p-4">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={member.avatar} alt={member.name} className="object-contain" />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-gray-500">{member.date_of_death}</p>
                          <p className="text-xs text-gray-400 mt-1">{member.city}, {member.state}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="hidden md:flex items-center space-x-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all duration-300"
                                style={{ width: `${member.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{member.progress || 0}%</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", member.favorite ? "text-green-500" : "text-gray-300")}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(member.id) }}
                          >
                            <Heart className={cn("h-5 w-5", member.favorite ? "fill-green-500" : "")} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="relative w-full flex justify-between mb-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", member.favorite ? "text-green-500" : "text-gray-300")}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(member.id) }}
                          >
                            <Heart className={cn("h-5 w-5", member.favorite ? "fill-green-500" : "")} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </div>
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage src={member.avatar} alt={member.name} className="object-contain" />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium text-center">{member.name}</h3>
                        <p className="text-sm text-gray-500 text-center">{member.date_of_death}</p>
                        <p className="text-xs text-gray-400 text-center">{member.city}, {member.state}</p>
                        <div className="flex items-center space-x-2 mt-4 w-full">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${member.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{member.progress || 0}%</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

