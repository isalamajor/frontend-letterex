"use client";
import '@/stylesheets/effects.css'
import { useEffect, useState } from "react";
import { SidebarDemo } from "@/components/sidebardemo";
import Pagination from '@mui/material/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";
import { MessageCirclePlus, Users, Star, Languages, Search, Telescope, 
ChevronLeft, ChevronRight, LogOut, MessagesSquare, PencilLine, Lock, LockOpen,  
SearchSlash, SearchX, Check } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';
import 'react-quill-new/dist/quill.bubble.css';
import LetterFlip from '@/components/flipLetter'
import rawLanguages from "@/components/languages.json";
import { ImageUploader } from '@/components/imageUploader';
import { Switch } from '@/components/ui/switch'
import { getCommunities, createCommunity, requestMembership, getMyCommunities } from '../../services/api/community'

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
  const [communities, setCommunities] = useState<Community[]>([])
  const [noCommunities, setNoCommunities] = useState(true)
  
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

  useEffect(() => {
    const fetchCommunities = async () => {
      const res = await getMyCommunities()
      if (res.ok) {
        setCommunities(res.communities)
        setNoCommunities(res.communities.length === 0)
      } else {
        openDialog({
          title: "Server Error",
          description: "An error occurred obtaining data",
          primaryActionText: "OK",
          size: 'md',
          type: 'error',
          autoDismiss: false
        })
        setNoCommunities(true)
      }
    }
    fetchCommunities()
  }, [])

  if (noCommunities) {
    return (
      <div className="text-gray-900 p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        
          <div className='flex  items-center flex-col mb-5'>
          <h1 className="ml-5 mt-10 lg:mt-0 text-5xl w-fit lg:text-md text-3xl font-semibold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-text text-center">
            Community
          </h1>
          
          <button  onClick={() => setNoCommunities(!noCommunities)}>click</button>

            <p>It seems that you're not part of a community yet...</p>
            <p className='text-gray-500 text-center md:w-[50%]'>The members of a community can post letters, suggest topics to write about, and chat! Join a community or create your own one and try it out!</p>
          </div>
          <div className="space-y-2 min-w-[200px]">
            <div className='md:grid md:grid-cols-2 gap-15'>
              <div>
                <h2 className='mb-5'> Find the one(s) that suit you best</h2>
                <CommunityList/>
              </div>
              <div>
                <h2 className='mb-5'>Or create your own 🐸 </h2>
                <CreateCommunityForm onCommunityCreated={(newCommunity) =>  { setCommunities([...communities, newCommunity])}}/>
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
    <>
      <CommunityBoard communities={communities}/>
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
    </>
  );
}

interface CommunityBoardProps {
  communities: Community[]
}


const CommunityBoard : React.FC<CommunityBoardProps> = ( { communities } ) => {
  const [isManager, setIsManager] = useState(true)
  const [communitySelected, setCommunitySelected] = useState<Community | null>(null)
  const [sectionSelected, setSectionSelected] = useState(0)

  return (
    
      <div className="text-gray-900 p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        
          <div className='flex  items-center flex-row mb-5 gap-5'>
            <img
            src={`/community-frogs-bw.png`}
            alt={'image'}
            className="w-30 h-30 rounded-sm border border-gray-300 dark:border-gray-600"
            />
            <div className='flex flex-col items-start'>
              <h1 className="mt-10 lg:mt-0 text-5xl w-fit lg:text-md text-3xl font-semibold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-text text-center">
                Community
              </h1>
              <h2>{communitySelected?.name}</h2>
            </div>
          </div>


        <div className='flex justify-between gap-2'>
          <div className='flex flex-row gap-3 items-center'>
          <Switch name="w-fit"  size ="large" onChange={(comId) => { if (comId) {
            const comSelected = communities.find(c => c.id === comId)
            if (comSelected) setCommunitySelected(comSelected)
          }}}>
            {communities.map(com =>
              <Switch.Control
              defaultChecked
              label={com.name}
              size="large"
              value={com.id}
              key={com.id}
              />
            )}
            </Switch>
            </div>
          <div className='flex flex-row gap-2'>
          <button className="bg-green-400 hover:bg-green-500 self-right text-white rounded-sm p-2 flex flex-row items-center gap-2"
          onClick={() => setNoCommunities(!noCommunities)}>
            <Telescope/>
            Explore
          </button>
            <button className="bg-red-400 hover:bg-red-500 self-right text-white rounded-sm p-2 flex flex-row items-center gap-2">
            <LogOut/>
            Leave Community
          </button>
          <button className="bg-orange-400 hover:bg-orange-500 self-right text-white rounded-sm p-2 flex flex-row items-center gap-2">
            <Star/>
            Manage Community
          </button>
          </div>
        </div>
          


          <div className='flex flex-col md:flex-row gap-2'>
            <SectionSelector onSelectionChange={(id) => {setSectionSelected(id); console.log(id);}}/>
          {/* Content */}

          { communitySelected && (
            sectionSelected === 0 ? <SuggestedTopics/> :
            sectionSelected === 1 ? <LetterBoard/> :
            sectionSelected === 2 ? <Forum community={communitySelected}/> :
            null
          )
          }
          </div>
          <MemberList/>
      </div>
  )
}

interface CommunityCardProps {
  id: string;
  name: string;
  creator: string;
  description: string;
  members: number;
  letters: number;
  language: string;
  isPrivate: boolean;
  userIsMember: boolean;
  userSentRequest: boolean;
}

const CommunityCard : React.FC<CommunityCardProps> = ( { id, name, description, creator, members, letters, language, userIsMember, userSentRequest, isPrivate } ) => {
  const [userSentRequestUpdated, setUserSentRequestUpdated] = useState(false)

  useEffect(() => {
    setUserSentRequestUpdated(userSentRequest)
  }, [])
  const sendRequest = async () => {
    const res = await requestMembership(id)
    if (res.ok) {
      setUserSentRequestUpdated(true)
    }
  }

   return(
    <div className="items-center px-8 py-4 rounded-lg bg-white border border-gray-200  hover:border-orange-200 shadow-md w-full flex flex-row justify-between gap-8" key={id}>
        <div className='flex flex-row gap-8'>
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
                <Users/>{ members?.toString() }
              </p>
              {/*<p className="text-gray-800 text-base dark:text-gray-200 mb-2 flex flex-row gap-1">
                <Mail/>{letters?.toString()} letters shared
              </p>*/}
              <p className="text-gray-800 text-base dark:text-gray-200 mb-2 flex flex-row gap-1">
                <Languages/>{language}
              </p>
            </div>
          </div>
        </div>
        <div className='flex h-30 items-start'>
          { userSentRequestUpdated ? 
          <p className='text-green-500 flex flex-row gap-1'><Check/>Request sent</p>
          :  
          <button className='bg-green-500 px-4 py-1 rounded-md text-white cursor-pointer hover:bg-green-600 flex align-bottom' onClick={sendRequest}>Join</button>
          }
        </div>
      </div>
   )
}



interface Friend {
    _id: string;
    nickname: string;
    image: string;
    points: number;
}

const MemberCard: React.FC<Friend> = ({ _id, nickname, image, points }) => {

  const goToProfile = (id: string) => (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    window.location.href = `/profile/${id}`;
  }

  return (
      <div className="p-4 rounded-lg bg-white hover:bg-gradient-to-r hover:from-red-100 hover:via-orange-100 hover:to-yellow-100 border border-gray-200 shadow-md w-full flex flex-row gap-3 items-center" onClick={goToProfile(_id)}>
        <img
            src={`http://localhost:3090/uploads/profile_pictures/${image}`}
            alt={image}
            className="w-14 h-14 rounded-full border border-gray-300 dark:border-gray-600 "
        />
        {/* Fecha y Diario */}
        <div className="flex flex-col gap-1 items-start justify-between">
          <h4 className="text-sm items-center text-gray-700 font-bold dark:text-gray-400">
            {nickname}
          </h4>
          <p className="text-sm text-gray-800 text-base dark:text-gray-200 mb-2">
            ⭐ {points} points
          </p>
        </div>
      </div>
  );
};

const MemberList = () => {
  const members = [
    {
      _id: 'd43434',
      nickname: 'Member name',
      image:'/default.png',
      points: 40
    },
    {
      _id: 'd43435',
      nickname: 'Member name',
      image:'/default.png',
      points: 40
    },
    {
      _id: 'd43436',
      nickname: 'Member name',
      image:'/default.png',
      points: 40
    },
    {
      _id: 'd43437',
      nickname: 'Member name',
      image:'/default.png',
      points: 40
    },
    {
      _id: 'd43438',
      nickname: 'Member name',
      image:'/default.png',
      points: 40
    },
    {
      _id: 'd43439',
      nickname: 'Member name',
      image:'/default.png',
      points: 40
    }
  ]
  return (
    <div className='w-full h-fit flex flex-row mt-10 gap-2'>
      <div className='p-2 rounded-lg bg-white text-clip hover:bg-gray-100 border border-gray-200 shadow-md flex justify-center items-center'>
        <ChevronLeft className='text-gray-800'/>
      </div>
    <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(0,1fr))] w-full"
  style={{
    gridTemplateColumns: `repeat(${Math.min(members.length, 6)}, auto)`,
  }}>
    {members.map(member => 
      <MemberCard key={member._id} _id={member._id} nickname={member.nickname} image={member.image} points={member.points}/>
    )}
    </div>
      <div className='p-2 rounded-lg bg-white text-clip hover:bg-gray-100 border border-gray-200 shadow-md flex justify-center items-center'>
        <ChevronRight className='text-gray-800'/>
      </div>
    </div>
  )
}

interface Community {
  id: string,
  name: string,
  creator: string,
  description: string,
  members: number,
  lettersShared: number,
  language: string,
  isPrivate: boolean,
  userIsMember: boolean,
  userSentRequest: boolean
}

const CommunityList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [learningLanguage, setLearningLanguage] = useState('English')
  const [searchFilter, setSearchFilter] = useState('')
  const [communities, setCommunities] = useState<Community[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const refreshCommunities = async () => {
      if (learningLanguage) {
        const res = await getCommunities(learningLanguage)
        if (res.ok) {
          setCommunities(res.communities)
        } else {
          setError(res.error)
        }
      }
    }

    refreshCommunities()
  }, [learningLanguage])


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
          <input placeholder="Search by community name..." className="flex-1 min-w-0 bg-transparent outline-none" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value.toLowerCase())}></input>
        </div>
    </div>
    { communities.length === 0 ? 
      <div className=' bg-gray-100 rounded-lg my-5 min-h-[55vh] flex flex-row gap-2 justify-center items-center'>
        <SearchSlash/> No Communities Yet
      </div>
      :
       communities.filter(c => c.name.toLowerCase().includes(searchFilter)).length === 0 ? 
        <div className=' bg-gray-100 rounded-lg my-5 min-h-[55vh] flex flex-row gap-2 justify-center items-center'>
        <SearchX/> No communities matching the filter
        </div>
      :
      <div className='flex flex-col justify-between'>
        <div className='flex flex-col gap-3 my-5 min-h-[55vh]'>
        {communities.filter(c => c.name.toLowerCase().includes(searchFilter)).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
        .map(com => 
        <div key={com.id}>
        <CommunityCard id={com.id} name={com.name} creator={com.creator} description={com.description} members={com.members} letters={com.lettersShared} language={com.language}
        isPrivate={com.isPrivate} userIsMember={com.userIsMember} userSentRequest={com.userSentRequest}/>
        </div>)}
        </div>
        {communities.length > ITEMS_PER_PAGE && (
          <Pagination count={Math.ceil(communities.length / ITEMS_PER_PAGE)} variant="outlined" shape="rounded" 
          onChange={(event, page) => setCurrentPage(page)} size="large"/>
        )} 
      </div>
      
    }
    </>
  )
}

interface CreateCommunityFormProps {
  onCommunityCreated: (newCommunity: Community) => void
}

const CreateCommunityForm : React.FC<CreateCommunityFormProps> = ({ onCommunityCreated }) => {
  const stylesInput = 'w-full p-2 bg-gray-100 border-1 border-gray-300 rounded-sm focus:border-orange-300 focus:ring-yellow-200 focus:ring-1 outline-none w-[50%]'
  const errorStylesInput = 'w-full p-2 bg-gray-100 border-1 border-red-500 rounded-sm focus:border-red-500 focus:ring-red-200 focus:ring-1 outline-none w-[50%]'
  const [invalidName, setInvalidName] = useState('')
  const [invalidDescription, setInvalidDescription] = useState('')
  const [invalidLanguage, setInvalidLanguage] = useState('')
  const [publicCommunity, setPublicCommunity] = useState(true)
  const [communityName, setCommunityName] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('')
  const [error, setError] = useState('')


  const createCommunityOnClick = async() => {
    if (communityName.length === 0) {
      setInvalidName('Fill up this field')
    } if (description.length === 0) {
      setInvalidDescription('Fill up this field')
    } if (language.length === 0) {
      setInvalidLanguage('Fill up this field')
    } if (communityName.length < 5) {
        setInvalidDescription('Name is too short. Take at least 5 characters.')
    } if (description.length < 10) {
        setInvalidDescription('Description is too short. Take at least 10 characters.')
    } else {
      const res = await createCommunity(communityName, language, description, !publicCommunity)
      if (res.ok) {
        onCommunityCreated(res.community)
      } else {
        setError("Error creating community. Try again later.")
      }
    }
  }
  
  return (
    <div className='flex flex-col gap-3'>
    <div className='flex flex-col'>
      <label>Name of the community</label>
      <input placeholder='Name of the community' className={invalidName ? errorStylesInput : stylesInput} value={communityName} onChange={e => {
        setInvalidName('')
        setCommunityName(e.target.value)
      }}></input>
    </div>
  
    <div className='flex flex-col'>
      <label>Language your community aims to practice</label>
      <Select 
        value={language} 
        onValueChange={(lang) => {
          setInvalidLanguage('')
          setLanguage(lang)}
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
        <textarea placeholder='Enter a description...' className={(invalidDescription ? errorStylesInput : stylesInput) + 'w-full h-full resize-none'}
        value={description} onChange={(e) => {
          setInvalidDescription('')
          setDescription(e.target.value)
        }}/> 
      </div>
    </div>

    <p className='font-semibold flex flex-row gap-1'>
      {publicCommunity ? <LockOpen/> : <Lock/>}
      Privacy
    </p>
    <div className='flex flex-col gap-0'>
      <label className='flex gap-2'>
        <input type="radio" name="option" value="public" checked={publicCommunity} onChange={() => setPublicCommunity(!publicCommunity)}/>
        Public Community, anyone can join
      </label>
      <label className='flex gap-2'>
        <input type="radio" name="option" value="private" checked={!publicCommunity} onChange={() => setPublicCommunity(!publicCommunity)}/>
        A join request is required, you control who can join or not.
      </label>
    </div>
    <button className="bg-green-500 hover:bg-green-600 self-right text-white rounded-sm p-2"
      onClick={() => createCommunityOnClick()}
    >Create Community</button>
    

    </div>
  )
}


const SuggestedTopics = () => {
  return (
    <div className="h-[35rem] w-[70%] border-15 border-gray-200 rounded-sm z-index-2 bg-gray-100 shadow-xl">
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
  )
}


const LetterBoard = () => {
  return (
    <div className="h-[35rem] w-[70%] border-2 border-gray-100 rounded-sm z-index-2 bg-white shadow-xl px-10 py-5 flex flex-col justify-between gap-2">
      <div>
        <h2 className="text-gray-900 text-center">Letter board</h2>
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
  )
}


interface ForumProps {
  community: Community
}

const Forum : React.FC <ForumProps> = ({ community }) => {
  return (
    <div className="h-[35rem] w-[70%] border-2 border-gray-100 rounded-sm z-index-2 bg-white shadow-xl px-10 py-5 flex flex-col justify-between gap-2">
      <div>
        <h2 className="text-gray-900 text-center">{community.name}'s forum</h2>
      </div>
      <div className='flex justify-end'>
        <p className="bg-white hover:text-yellow-400 hover:bg-yellow-50 ring-gray-400 hover:ring-yellow-300 ring-2 text-gray-900 rounded-sm p-2">Publish</p>
      </div>
      
  </div>
  )
}



interface SectionSelectorProps {
  onSelectionChange: (id: number) => void
}

const SectionSelector: React.FC<SectionSelectorProps> = ({ onSelectionChange }) => {
  const [sectionSelected, setSectionSelected] = useState(0)
  const sections = [{
    id: 0,
    name: 'Suggested',
    description: 'Members might suggest topics for other to write about in their letters. Here you can share and find inspiration',
    Icon: 'PencilLine'
  },
  {
    id: 1,
    name: 'Letterboard',
    description: 'Share letters with the whole community! Anyone can read it or take it and correct it',
    Icon: 'MessagesSquare'
  },
  {
    id: 2,
    name: 'Forum',
    description: 'This is a space where members can discuss different topics and solve doubts',
    Icon: 'LogOut'
  }]

  const iconsMap = { PencilLine, MessagesSquare, LogOut }

  return (
    <div className='w-[30%] flex flex-col gap-2'>
      {sections.map(section => {
            const IconComponent = iconsMap[section.Icon as keyof typeof iconsMap];
            return (
              <div key={section.id} className="flex flex-row cursor-pointer" onClick={() => {onSelectionChange(section.id); setSectionSelected(section.id)}}>
                <p className="flex rounded-l-lg bg-gray-200 shadow-md w-[20%] text-2xl items-center justify-center align-middle py-10 items-center
                bg-orange-300">
                  <span className=" transition-opacity duration-900">
                    <IconComponent className='text-white' size={30} stroke-width={2}/>
                  </span>
                </p> 
                <div className={`px-8 py-4 rounded-r-lg bg-gray-50 shadow-md w-full max-w-5xl text-black ${section.id === sectionSelected && 'border-2 border-l-0 border-orange-200'}`}>
                  <h3 className="font-semibold">{section.name}</h3> 
                  <p>{section.description}</p>
                </div>
              </div>

            )
      }
      )}
      </div>
  )
}
