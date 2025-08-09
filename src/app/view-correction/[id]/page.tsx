"use client";
import { useEffect, useRef } from "react";
import { SidebarDemo } from "@/components/sidebardemo";
import Link from "next/link";
import { editLetter } from "@/services/api";
import { useState } from "react"
import { Calendar, parseDate } from "@internationalized/date"
import { DateField, DateInput } from "@/components/ui/datefield"
import { Label } from "@/components/ui/field"
import { getLetterToCorrect } from "@/services/api";
import { Check, X, Trash  } from "lucide-react";
import { use } from "react";
import { LabelSelect } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useId } from "react";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";
import TextCorrections from "@/components/textCorrections";
import { updateLetterCorrections, sendLetterBack } from "@/services/api";
import { send } from "process";


interface Correccion {
  textOriginal: string;
  textCorrected: string;
  startIndex: number;
  endIndex: number;
}


export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="page-container">
      <SidebarDemo>
        <CorrectLetterPageContent id={id}/>
      </SidebarDemo>
    </div>
  );
}



const CorrectLetterPageContent = ({ id }: { id: string }) => {
  
  const textRef = useRef<HTMLDivElement | null>(null);
  const correctionRef = useRef<HTMLDivElement | null>(null);
  const [currentCorrectionText, setcurrentCorrectionText] = useState<string>("");
  const [editingCorrection, setEditingCorrection] = useState<Correccion | null>(null);
  const [overlapping, setOverlapping] = useState<boolean>(false);
  const [valuesChanged, setValuesChanged] = useState(true);
  const [title, setTitle] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [date, setDate] = useState(() => parseDate(new Date().toISOString().split("T")[0]));
  const [correctionMode, setCorrectionMode] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<{ text: string, rect: DOMRect | null, startIndex:number, endIndex:number } | null>(null);
  const [corrections, setCorrections] = useState<Correccion[]>([]);
  const [sentBack, setSentBack] = useState(false);


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
    (async () => {
      const letterData = await getLetterToCorrect(id);
      console.log("Letter data:", letterData);
      if (!letterData) {
        console.error("No letter data found for ID:", id);
        return;
      }
      setTitle(letterData.originalLetter.title || "");
      setLetterContent(letterData.originalLetter.content || "");
      setDate(parseDate(new Date(letterData.originalLetter.created_at).toISOString().split("T")[0]));
      setCorrections(letterData.corrections || []);
      setSentBack(letterData.sentBack || false);
    })();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        correctionRef.current &&
        !correctionRef.current.contains(event.target as Node)
      ) {
        setcurrentCorrectionText("");
        setEditingCorrection(null);
        setSelectionInfo(null);
      }
    };
  
    // Añadir el listener con un pequeño delay
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0); // se ejecuta después del click actual
  
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectionInfo]);
  

  const sendBackOnClick = async () => {
    if (!id) return;
    try {
      const response = await sendLetterBack(id);
      if (response === 0) {
        setSentBack(true);
        openDialog({
          title: "Letter sent back",
          description: "The letter has been sent back successfully.",
          primaryActionText: "OK",
          autoDismiss: true,
          size: 'md',
          type: 'success'
        });
      } else {
        openDialog({
          title: "Fail to send back",
          description: "There was an error sending letter back :(",
          primaryActionText: "OK",
          autoDismiss: true,
          size: 'md',
          type: 'error'
        })
      }
    } catch (error) {
      openDialog({
        title: "Fail to send back",
        description: "There was an error sending letter back :(",
        primaryActionText: "OK",
        autoDismiss: true,
        size: 'md',
        type: 'error'
      })
    }
  };

  return (
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        
        <div className="flex gap-2 flex-1">
            <div
              className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 py-10 px-20"
            >

              {/* Title field */}
              <p
                className="placeholder-gray-400 text-center text-2xl font-bold text-gray-700 bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] p-4 transition-transform duration-300 animate-gradient-dark w-full focus:border-blue-500 outline-none caret-[#8EBA03]"
              >{title}</p>
              
              
              {/* Date field */}
              <div className="flex flex-row items-center gap-4 w-[50%] text-black justify-end w-full">
                <p>{date.toString()}</p>
              </div>

              {/* Correcting tools */}
              
              { !sentBack &&
              <button onClick={() => setCorrectionMode(!correctionMode)} className= {correctionMode ? "text-red-500" : "text-black"}>
              🖍️ Correct 
              </button>
  }

              {/* Letter content field */}
              
              <div
                onMouseUp={() => {
                  setOverlapping(false);
                  if (!correctionMode) return;

                  const selection = window.getSelection();
                  if (selection && selection.toString().trim()) {
                    const range = selection.getRangeAt(0);

                    // Crea un rango desde el inicio del contenedor hasta el inicio de la selección
                    const preRange = document.createRange();
                    console.log("2:", textRef.current);
                    if (!textRef.current) return;
                    preRange.setStart(textRef.current, 0);
                    preRange.setEnd(range.startContainer, range.startOffset);

                    const startIndex = preRange.toString().length;
                    const endIndex = startIndex + range.toString().length;

                    // Check overlapping
                    const overlapping = corrections.some(c =>
                      startIndex < c.endIndex && endIndex > c.startIndex
                    );
                    if (overlapping) {setOverlapping(true); return; }

                    const rect = range.getBoundingClientRect();

                    setSelectionInfo({
                      text: selection.toString(),
                      rect,
                      startIndex,
                      endIndex
                    });
                  }
                }}
                className={`w-full h-[70%] p-4 text-gray-800 outline-none rounded cursor-text text-xl leading-loose
                ${correctionMode && overlapping ? ("selection:bg-red-200") : ("selection:bg-yellow-200") }`}>
                <TextCorrections
                  ref={textRef}
                  text={letterContent}
                  corrections={corrections}
                  onCorrectionClick={(correction, rect) => {
                    setEditingCorrection(correction);
                    setcurrentCorrectionText(correction.textCorrected);
                    setSelectionInfo({
                      text: correction.textOriginal,
                      rect,
                      startIndex: correction.startIndex,
                      endIndex: correction.endIndex
                    }
                    )}}
                />
              </div>

              {selectionInfo && selectionInfo.rect && (
                <div
                  ref={correctionRef}
                  style={{
                    position: "absolute",
                    top: selectionInfo.rect.bottom + window.scrollY + 8,
                    left: selectionInfo.rect.left + window.scrollX,
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "8px",
                    zIndex: 1000,
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600 mb-1">
                    {!sentBack ? '🖍️ Correcting' : '🖍️ Correction'}
                    </p>
                    <div className="flex items-center gap-2">
                      <X
                        onClick={() => {
                          setSelectionInfo(null);
                          // Aquí podrías agregar la lógica para guardar la corrección
                          console.log("Correction saved for:", selectionInfo.text);
                        }}
                        className="w-5 h-5 text-blue-500 hover:text-white hover:bg-blue-500 hover:rounded"
                      ></X>
                      </div>
                  </div>
                  <textarea
                    className="border w-64 p-2 text-sm rounded text-gray-800"
                    rows={3}
                    disabled={sentBack}
                    placeholder="Enter your correction..."
                    value={currentCorrectionText}
                    onChange={(e) => {setcurrentCorrectionText(e.target.value);}}
                  />
                </div>
              )}

            {/* Buttons */}
            <div className="flex justify-between h-[5%] col items-center gap-4 mt-4">
              
              <Link href={"/homepage"}>
                <button>
                    <div className="h-[100%] w-auto flex items-center justify-center bg-[#FF6347] text-white rounded py-2 px-4 hover:bg-[#c75945] transition-colors">
                    Back
                    </div>
                </button>
              </Link>

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
          onPrimaryAction={() => {
            console.log('Primary action clicked for type:', dialogConfig.type)
          }}
          letterId={id}
          sharedWith={[]}
          onShareSuccess={() => {}}
        />
      </div>
  );
}
