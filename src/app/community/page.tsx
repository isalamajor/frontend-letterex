"use client";
import '@/stylesheets/effects.css'
import { useEffect, useState } from "react";
import { SidebarDemo } from "@/components/sidebardemo";
import Pagination from '@mui/material/Pagination';
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";
import { MessageCirclePlus, User, Users, Mail, Star, Languages, Search } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';
import 'react-quill-new/dist/quill.bubble.css';
import LetterFlip from '@/components/flipLetter'
import rawLanguages from "@/components/languages.json";
import { ImageUploader } from '@/components/imageUploader';
import { TextField } from 'react-aria-components';

const ITEMS_PER_PAGE = 3

const languages = rawLanguages.languages as { name: string; image: string }[];


const suggestedTopics = [{
  id: 1,
  title: 'Tile of suggested topic',
  description: 'Description of suggested topic. Must explain in detail what the writing topic is about. And do not forget to include some suggestions.',
  author: 'Author',
  date: new Date()
}, 
{
  id: 2,
  title: 'Tile of suggested topic',
  description: 'Description of suggested topic. Must explain in detail what the writing topic is about.',
  author: 'Author',
  date: new Date()
},
{
  id: 3,
  title: 'Tile of suggested topic',
  description: 'Description of suggested topic. Must explain in detail what the writing topic is about.',
  author: 'Author',
  date: new Date()
}]


export default function Home() {
  return (
    <div className="page-container">
      <SidebarDemo>
        <CommunityPageContent/>
      </SidebarDemo>
    </div>
  );
}



const CommunityPageContent = () => {
  
  // Dialog
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean
    title: string
    description: string
    primaryActionText: string
    autoDismiss: boolean
    size: 'sm' | 'md' | 'lg'
    type: DialogType
  }>({
    isOpen: false,
    title: "Payment Successful!",
    description: "Your payment has been processed successfully. You will receive a confirmation email shortly.",
    primaryActionText: "View Receipt",
    autoDismiss: true,
    size: 'md',
    type: 'success'
  })
  
  const openDialog = (config: Partial<typeof dialogConfig>) => {
    setDialogConfig(prev => ({ ...prev, ...config, isOpen: true }))
  }

  const closeDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }))
  }
  
  const a = 0;

  if (a === 0) {
    return (
      <div className="text-gray-900 p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        
          <div className='flex  items-center flex-col mb-5'>
          <h1 className="ml-5 mt-10 lg:mt-0 text-5xl w-fit lg:text-md text-3xl font-semibold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-text text-center">
            Community
          </h1>
            <p>It seems that you're not part of a community yet...</p>
            <p className='text-gray-500 text-center md:w-[50%]'>The members of a community can post letters, suggest topics to write about, and chat! Join a community or create your own one and try it out!</p>
          </div>
          <div className="space-y-2 min-w-[200px]">
            <div className='md:grid md:grid-cols-2 gap-15'>
              <div>
                <h2 className='mb-5'> Find the one(s) that suit you best</h2>
                <CommunityList></CommunityList>

              </div>
              <div>
                <h2 className='mb-5'>Or create your own 🐸 </h2>
                <CreateCommunityForm/>
              </div>
            </div>
            </div>

        <SuccessDialog
          isOpen={dialogConfig.isOpen}
          onClose={closeDialog}
          title={dialogConfig.title}
          description={dialogConfig.description}
          primaryActionText={dialogConfig.primaryActionText}
          autoDismiss={dialogConfig.autoDismiss}
          autoDismissDelay={2000}
          size={dialogConfig.size}
          type={dialogConfig.type}
        />
      </div>
  )
  }


  return (
      <div className="text-gray-900 p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        
          <h1 className="ml-5 mt-10 lg:mt-0 text-5xl lg:text-md h-[7%] text-3xl font-semibold w-fit bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-text text-center lg:text-left">
            Community
          </h1>
          
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
            <div className="h-[35rem] border-15 border-gray-200 rounded-sm z-index-2 bg-gray-100 shadow-xl">
                <h2 className="text-gray-900 text-center my-2">Suggested topics</h2>
                <div className="w-full flex justify-end">
                  <MessageCirclePlus className="bg-white hover:text-yellow-400 ring-gray-400 ring-2 text-gray-900 rounded-sm h-10 w-10 p-1 mr-5"></MessageCirclePlus>
                </div>
                <div className="grid grid-cols-4 m-3 gap-3">
                {suggestedTopics.map(topic => 
                  <div className="group bg-white border-2 border-gray-100 aspect-square p-2 rounded-sm shadow-lg ">
                    <h4 className='group-hover:text-yellow-400'>{topic.title}</h4>
                    <p>By {topic.author}</p>
                    <p className="text-xs">{topic.description.slice(0,94)}{topic.description.length > 95 && "..."}</p>
                  </div>
                )}
                </div>
            </div>
            <div className="h-[35rem] border-2 border-gray-100 rounded-sm z-index-2 bg-white shadow-xl px-10 py-5 flex flex-col justify-between gap-2">
                <div>
                  <h2 className="text-gray-900 text-center">Letter board</h2>
                  <p className='mx-15 text-center'>Publish one of your letters here so that your a community mate can have it and correct it</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 self-center">
                {suggestedTopics.map(letter => 
                  <LetterFlip key={letter.id} title={letter.title} author={letter.author}/>
                )}
                </div>
                <div className='flex justify-end'>
                  <p className="bg-white hover:text-yellow-400 hover:bg-yellow-50 ring-gray-400 hover:ring-yellow-300 ring-2 text-gray-900 rounded-sm p-2">Publish</p>
                </div>
            </div>
          </div>
        <SuccessDialog
          isOpen={dialogConfig.isOpen}
          onClose={closeDialog}
          title={dialogConfig.title}
          description={dialogConfig.description}
          primaryActionText={dialogConfig.primaryActionText}
          autoDismiss={dialogConfig.autoDismiss}
          autoDismissDelay={2000}
          size={dialogConfig.size}
          type={dialogConfig.type}
        />
      </div>
  );
}


interface CommunityCardProps {
  name: String;
  creator: String;
  description: String;
  members: Number;
  letters: Number;
  language: String;
}

const CommunityCard : React.FC<CommunityCardProps> = ( { name, description, creator, members, letters, language } ) => {
   return(
    <div className="items-center px-8 py-4 rounded-lg bg-white hover:bg-gradient-to-r hover:from-indigo-100 hover:via-purple-100 hover:to-pink-100 border border-gray-200 shadow-md w-full flex flex-row gap-8">
        <img
            src={`/community-frogs-bw.png`}
            alt={'image'}
            className="w-30 h-30 rounded-sm border border-gray-300 dark:border-gray-600"
        />
        <div className="flex flex-col gap-2 items-start justify-between">
          <h4 className="items-center text-gray-700 font-bold dark:text-gray-400">
            {name}
          </h4>
          <p>{description}</p>
          <div className='grid grid-cols-[auto_auto] md:grid-cols-[auto_auto_auto_auto] gap-3'>
            <p className="text-gray-800 text-base dark:text-gray-200 mb-2 flex flex-row gap-1">
              <Star/>{ creator }
            </p>
            <p className="text-gray-800 text-base dark:text-gray-200 mb-2 flex flex-row gap-1">
              <Users/>{ members.toString() }
            </p>
            <p className="text-gray-800 text-base dark:text-gray-200 mb-2 flex flex-row gap-1">
              <Mail/>{letters.toString()} letters shared
            </p>
            <p className="text-gray-800 text-base dark:text-gray-200 mb-2 flex flex-row gap-1">
              <Languages/>Learning {language.toLocaleLowerCase()}
            </p>
          </div>
          
        </div>
      </div>
   )
}

const CommunityList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [learningLanguage, setLearningLanguage] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const communities = [
    {
      name: 'Community Name',
      creator: 'isalamajor',
      description: 'Descripción de la comunidad, tipo de miembros que la componen, bio, qué hacen, demás',
      users: 15,
      lettersShared: 70,
      language: 'English'
    },
    {
      name: 'Community Name',
      creator: 'isalamajor',
      description: 'Descripción de la comunidad, tipo de miembros que la componen, bio, qué hacen, demás',
      users: 15,
      lettersShared: 70,
      language: 'English'
    },
    {
      name: 'Community Name',
      creator: 'isalamajor',
      description: 'Descripción de la comunidad, tipo de miembros que la componen, bio, qué hacen, demás',
      users: 15,
      lettersShared: 70,
      language: 'English'
    },
    {
      name: 'Community Name',
      creator: 'isalamajor',
      description: 'Descripción de la comunidad, tipo de miembros que la componen, bio, qué hacen, demás',
      users: 15,
      lettersShared: 70,
      language: 'English'
    },
    {
      name: 'Community Name',
      creator: 'isalamajor',
      description: 'Descripción de la comunidad, tipo de miembros que la componen, bio, qué hacen, demás',
      users: 15,
      lettersShared: 70,
      language: 'English'
    }
  ]
  return (
    <>
    <div className='w-full flex flex-row items-end justify-between'>

      <div>
        <label className="text-gray-900">Learn a language</label>
        <Select 
        value={learningLanguage} 
        onValueChange={(sender) => {setLearningLanguage(sender)}}
        >
          <SelectTrigger className="text-black bg-white h-10 rounded-md ring-transparent text-md">
            <SelectValue placeholder="🌐 (Select a language)"/>
          </SelectTrigger>
          <SelectContent>
            {/*filterSenders !== "" && <SelectItem key={"None"} value={"None"} className="text-gray-500"> (Clear selection)</SelectItem>*/}
            {languages.map((lang) => (
              <SelectItem key={lang.name} value={lang.name}>
                <div className="flex flex-row gap-2">
                <img src={lang.image} className="h-5 w-5"></img>{lang.name}
                </div>
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
        <div className="flex flex-row gap-2 items-center h-10 cursor-pointer border border-lightblack text-gray-700 rounded-sm py-2 px-4 bg-gray-50 w-[45%]">
          <Search className="text-gray-500 w-fit"></Search>
          <input placeholder="Search by community name..." className="flex-1 min-w-0 bg-transparent outline-none" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}></input>
        </div>
    </div>
    <div className='flex flex-col justify-between'>
      <div className='flex flex-col gap-3 my-5 min-h-[55vh]'>
      {communities.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
      .map(com => <CommunityCard name={com.name} creator={com.creator} description={com.description} 
      members={com.users} letters={com.lettersShared} language={com.language}></CommunityCard>)}
      </div>
      {communities.length > ITEMS_PER_PAGE && (
        <Pagination count={Math.ceil(communities.length / ITEMS_PER_PAGE)} variant="outlined" shape="rounded" 
        onChange={(event, page) => setCurrentPage(page)} size="large"/>
      )} 
    </div>
    </>
  )
}


const CreateCommunityForm = () => {
  const stylesInput = 'w-full p-2 bg-gray-100 border-1 border-gray-300 rounded-sm focus:border-orange-300 focus:ring-yellow-200 focus:ring-1 outline-none w-[50%]'
  const errorStylesInput = 'w-full p-2 bg-gray-100 border-1 border-red-500 rounded-sm focus:border-red-500 focus:ring-red-200 focus:ring-1 outline-none w-[50%]'
  const [invalidName, setInvalidName] = useState(false);
  const [invalidDescription, setInvalidDescription] = useState(false);
  const [communityData, setCommunityData] = useState({
    name: '',
    description: '',
    language: ''
  })
  
  return (
    <div className='flex flex-col gap-3'>
    <div className='flex flex-col'>
      <label>Name of the community</label>
      <input placeholder='Name of the community' className={invalidName ? errorStylesInput : stylesInput}></input>
    </div>
  
    <div className='flex flex-col'>
      <label>Language your community aims to practice</label>
      <Select 
        value={communityData.language} 
        onValueChange={(lang) => {
          let updated = communityData
          updated.language = lang
          setCommunityData(updated)}
        }
        >
          <SelectTrigger className="text-black bg-gray-100 border-gray-300 border-1 h-10 rounded-md ring-transparent text-md">
            <SelectValue placeholder="🌐 (Select a language)"/>
          </SelectTrigger>
          <SelectContent>
            {/*filterSenders !== "" && <SelectItem key={"None"} value={"None"} className="text-gray-500"> (Clear selection)</SelectItem>*/}
            {languages.map((lang) => (
              <SelectItem key={lang.name} value={lang.name}>
                <div className="flex flex-row gap-2 text-md">
                <img src={lang.image} className="h-5 w-5"></img>{lang.name}
                </div>
                </SelectItem>
            ))}
          </SelectContent>
      </Select>
    </div>

    <div className='grid grid-cols-3 gap-2'>
      <div className='col-span-1'>
        <label>Select a picture</label>
        <ImageUploader onImageSelect={() => {}} type='community'/>
      </div>   
      
      <div className='col-span-2 flex flex-col'>
        <label>Description, what does it aim for?</label>
        <textarea placeholder='Enter a description...' className={(invalidDescription ? errorStylesInput : stylesInput) + 'w-full h-full resize-none'}/> 
      </div>
    </div>

    
      <button className="bg-green-500 hover:bg-green-600 self-right text-white rounded-sm p-2">Create Community</button>
    

    </div>
  )
}
