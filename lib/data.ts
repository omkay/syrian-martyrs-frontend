import type { Martyr } from "./types"

export const martyrs: Martyr[] = [
  {
    id: "1",
    name: "Ahmad Khalid",
    date: "March 15, 2011",
    location: "Daraa",
    cause: "Peaceful Protest",
    description:
      "Lost his life during the early peaceful protests in Daraa. Ahmad was a local teacher who joined the demonstrations calling for democratic reforms.",
    age: 32,
    gender: "Male",
    occupation: "Teacher",
    familyStatus: "Married with two children",
    image: "/placeholder.svg?height=400&width=300",
    testimonials: [
      {
        id: "t1",
        author: "Mohammed Khalid",
        relationship: "Brother",
        content:
          "Ahmad was a peaceful man who believed in the power of education to change society. He never carried weapons and was committed to non-violent protest.",
        date: "April 2011",
      },
      {
        id: "t2",
        author: "Samira Nour",
        relationship: "Colleague",
        content:
          "We taught at the same school for five years. Ahmad was beloved by his students and always encouraged critical thinking.",
        date: "May 2011",
      },
    ],
    sources: [
      {
        name: "Syrian Human Rights Watch",
        url: "https://example.org/reports/daraa-march-2011",
        date: "April 10, 2011",
        type: "report",
      },
      {
        name: "Al-Jazeera News Report",
        url: "https://example.org/news/early-protests",
        date: "March 20, 2011",
        type: "news",
      },
    ],
  },
  {
    id: "2",
    name: "Layla Ibrahim",
    date: "April 22, 2011",
    location: "Homs",
    cause: "Shelling",
    description:
      "Civilian casualty during early military operations in Homs. Layla was a medical student who was volunteering at a makeshift clinic when the area was shelled.",
    age: 24,
    gender: "Female",
    occupation: "Medical Student",
    familyStatus: "Single",
    image: "/placeholder.svg?height=400&width=300",
    testimonials: [
      {
        id: "t3",
        author: "Dr. Fadi Qasim",
        relationship: "Supervisor",
        content:
          "Layla showed exceptional promise as a future doctor. She was dedicated to helping others and refused to leave the city despite the dangers.",
        date: "May 2011",
      },
    ],
    sources: [
      {
        name: "Doctors Without Borders Report",
        url: "https://example.org/reports/medical-casualties-homs",
        date: "June 5, 2011",
        type: "report",
      },
    ],
  },
  {
    id: "3",
    name: "Mohammed Al-Sayid",
    date: "July 31, 2012",
    location: "Aleppo",
    cause: "Airstrike",
    description:
      "Lost during airstrikes on residential areas in Aleppo. Mohammed was a baker who continued to provide bread to his neighborhood despite food shortages.",
    age: 45,
    gender: "Male",
    occupation: "Baker",
    familyStatus: "Married with four children",
    image: "/placeholder.svg?height=400&width=300",
    testimonials: [
      {
        id: "t4",
        author: "Yasmin Al-Sayid",
        relationship: "Daughter",
        content:
          "My father insisted on keeping his bakery open even as the situation worsened. He said people needed bread more than ever during the crisis.",
        date: "August 2012",
      },
    ],
    sources: [
      {
        name: "Aleppo Today News",
        url: "https://example.org/news/aleppo-airstrikes-july",
        date: "August 2, 2012",
        type: "news",
      },
    ],
  },
  {
    id: "4",
    name: "Fatima Nour",
    date: "October 14, 2013",
    location: "Damascus",
    cause: "Siege",
    description:
      "Died due to lack of medical supplies during siege conditions. Fatima had a chronic condition that required regular medication.",
    age: 67,
    gender: "Female",
    occupation: "Retired Teacher",
    familyStatus: "Widowed with three adult children",
    image: "/placeholder.svg?height=400&width=300",
    testimonials: [
      {
        id: "t5",
        author: "Khalid Nour",
        relationship: "Son",
        content:
          "We tried everything to get my mother's medication, but the siege made it impossible. She suffered greatly in her final days.",
        date: "November 2013",
      },
    ],
    sources: [
      {
        name: "UN Humanitarian Report",
        url: "https://example.org/reports/damascus-siege-impact",
        date: "December 5, 2013",
        type: "report",
      },
    ],
  },
  {
    id: "5",
    name: "Karim Masri",
    date: "February 3, 2014",
    location: "Idlib",
    cause: "Conflict",
    description:
      "Civilian caught in crossfire during escalating conflict. Karim was returning home from work when fighting broke out in his neighborhood.",
    age: 29,
    gender: "Male",
    occupation: "Electrician",
    familyStatus: "Married with one child",
    image: "/placeholder.svg?height=400&width=300",
    testimonials: [
      {
        id: "t6",
        author: "Amir Hassan",
        relationship: "Friend",
        content:
          "Karim was not involved in politics or fighting. He was simply trying to support his family during difficult times.",
        date: "February 2014",
      },
    ],
    sources: [
      {
        name: "Idlib Civil Defense Records",
        url: "https://example.org/records/civilian-casualties-feb-2014",
        date: "March 10, 2014",
        type: "official",
      },
    ],
  },
  {
    id: "6",
    name: "Samira Khalil",
    date: "August 19, 2015",
    location: "Raqqa",
    cause: "Violence",
    description:
      "Activist who documented human rights abuses. Samira was a journalist who continued reporting on conditions in Raqqa despite threats to her safety.",
    age: 35,
    gender: "Female",
    occupation: "Journalist",
    familyStatus: "Single",
    image: "/placeholder.svg?height=400&width=300",
    testimonials: [
      {
        id: "t7",
        author: "International Journalists Association",
        relationship: "Professional Organization",
        content:
          "Samira Khalil exemplified the courage of journalists who risk everything to tell the truth. Her documentation of human rights abuses was invaluable.",
        date: "September 2015",
      },
    ],
    sources: [
      {
        name: "Committee to Protect Journalists",
        url: "https://example.org/reports/journalists-killed-syria-2015",
        date: "December 15, 2015",
        type: "report",
      },
      {
        name: "Syrian Journalists Network",
        url: "https://example.org/memorials/samira-khalil",
        date: "August 25, 2015",
        type: "social",
      },
    ],
  },
]

export function getMartyrById(id: string): Martyr | undefined {
  return martyrs.find((martyr) => martyr.id === id)
}
