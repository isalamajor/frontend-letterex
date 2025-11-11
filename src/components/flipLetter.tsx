
import ReactCardFlip from 'react-card-flip';
import { useState, Component } from 'react'


interface Props {
  width: number,
  height: number,
  title: String,
  author: String
}

const LetterIconFlipped : React.FC<Props> = ({width, height, title, author}) => (
    <svg
    width={width}
    height={height}
    viewBox="0 0 200 140"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    >
        <rect x="5" y="5" width="180" height="100" rx="15" ry="15" fill="#ffffffff" stroke="#848484ff" stroke-width="3" stroke-linecap="round"/>
      <text
      x="50%"
      y="50%"
      text-anchor="middle"
      dominant-baseline="middle"
      fill="#555"
      font-size="18"
      font-family="sans-serif"
    >
      {title || 'Title'}
    </text>
    </svg>
)

const LetterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    className="w-[13rem] h-[7rem]"
    viewBox="0 0 190 110"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x={5}
      y={5}
      width={180}
      height={100}
      rx={15}
      ry={15}
      fill="#ffffff"
      stroke="#848484"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <line x1={10} y1={10} x2={95} y2={75} stroke="#848484" strokeWidth={3} strokeLinecap="round" />
    <line x1={180} y1={10} x2={95} y2={75} stroke="#848484" strokeWidth={3} />
    <line x1={10} y1={100} x2={70} y2={55} stroke="#848484" strokeWidth={3} />
    <line x1={180} y1={100} x2={120} y2={55} stroke="#848484" strokeWidth={3} />
  </svg>
);


const LetterIcon2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={props.width}
    height={props.height}
    viewBox="0 0 200 140"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x={5}
      y={5}
      width={180}
      height={100}
      rx={15}
      ry={15}
      fill="#ffffff"
      stroke="#848484"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <line x1={10} y1={10} x2={95} y2={75} stroke="#848484" strokeWidth={3} strokeLinecap="round" />
    <line x1={180} y1={10} x2={95} y2={75} stroke="#848484" strokeWidth={3} />
    <line x1={10} y1={100} x2={70} y2={55} stroke="#848484" strokeWidth={3} />
    <line x1={180} y1={100} x2={120} y2={55} stroke="#848484" strokeWidth={3} />
  </svg>
);



export const LetterFlip = ({title, author} : {title: String, author: String}) => {
  const [flipped, setFlipped] = useState(false);
  return (
    /*<ReactCardFlip isFlipped={flipped} flipDirection="horizontal">
      <div onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(!flipped)} className="cursor-pointer ">
        <div className="flex align-center justify-center flex-col
        w-[13rem] h-[7rem] bg-white border-3 border-[#848484] rounded-[15px] ">
            <p className="text-md font-semibold text-gray-900 px-2 pt-2">Madre mia que titulo mas largo es largiuisuiimo</p>
            <p className="text-sm text-gray-700 px-2 pb-2">{author}</p>
        </div>
      </div>
      
      <div onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)} onClick={() => setFlipped(!flipped)} className="">
        <LetterIcon/>
      </div>
    </ReactCardFlip>*/
    <>
      {
        flipped ? 
      <div onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(!flipped)} className="cursor-pointer ">
        <div className="flex align-center justify-center flex-col
        w-[13rem] h-[7rem] bg-white border-3 border-[#848484] rounded-[15px] ">
            <p className="text-md font-semibold text-gray-900 px-2 pt-2">Madre mia que titulo mas largo es largiuisuiimo</p>
            <p className="text-sm text-gray-700 px-2 pb-2">{author}</p>
        </div>
      </div>
      :
      <div onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)} onClick={() => setFlipped(!flipped)} className="">
        <LetterIcon/>
      </div>
    }
    </>
  );
};


export default LetterFlip