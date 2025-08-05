"use client";
import { useEffect, useRef } from "react";
import { SidebarDemo } from "@/components/sidebardemo";
import Link from "next/link";
import { editLetter } from "@/services/api";
import { useState } from "react"
import { Calendar, parseDate } from "@internationalized/date"
import { DateField, DateInput } from "@/components/ui/datefield"
import { Label } from "@/components/ui/field"
import { getLetter } from "@/services/api";
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

  const correctionRef = useRef<HTMLDivElement | null>(null);
  const [currentCorrectionText, setcurrentCorrectionText] = useState<string>("");
  const [editingCorrection, setEditingCorrection] = useState<Correccion | null>(null);
  const [valuesChanged, setValuesChanged] = useState(true);
  //let date = parseDate(new Date().toISOString().split("T")[0]);
  const [title, setTitle] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [date, setDate] = useState(() => parseDate(new Date().toISOString().split("T")[0]));
  const [correctionMode, setCorrectionMode] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<{ text: string, rect: DOMRect | null } | null>(null);
  const [corrections, setCorrections] = useState<Correccion[]>([]);


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
      const letterData = await getLetter(id);
      console.log("Letter data:", letterData);
      if (!letterData) {
        console.error("No letter data found for ID:", id);
        return;
      }
      setTitle(letterData.title || "");
      setLetterContent(letterData.content || "");
      setDate(parseDate(new Date(letterData.created_at).toISOString().split("T")[0]));
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


  const addCorrection = () => {
    if (!selectionInfo || !selectionInfo.text || currentCorrectionText === "") return;

    if (selectionInfo.text.endsWith(" ")) {
      // Eliminar el espacio al final del texto seleccionado
      selectionInfo.text = selectionInfo.text.slice(0, -1);
    }

    if (selectionInfo.text.length === 0) return;

    const newCorrection: Correccion = {
      textOriginal: selectionInfo.text,
      textCorrected: currentCorrectionText,
      startIndex: letterContent.indexOf(selectionInfo.text),
      endIndex: letterContent.indexOf(selectionInfo.text) + selectionInfo.text.length,
    };

    setCorrections([...corrections, newCorrection]);
    setSelectionInfo(null);
    setcurrentCorrectionText("");
    setEditingCorrection(null);
    setValuesChanged(true);
    console.log("New correction added:", newCorrection);
  };

  const editCorrection = () => {
    if (!editingCorrection || !currentCorrectionText) return;
    const updatedCorrections = corrections.map((correction) => {
      if (
        correction.startIndex === editingCorrection.startIndex &&
        correction.endIndex === editingCorrection.endIndex
      ) {
        return {
          ...correction,
          textCorrected: currentCorrectionText,
        };
      }
      return correction;
    });
    setCorrections(updatedCorrections);
    setEditingCorrection(null);
    setcurrentCorrectionText("");
    setSelectionInfo(null);
    setValuesChanged(true);
    console.log("Correction edited:", updatedCorrections);
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
              <button onClick={() => setCorrectionMode(!correctionMode)} className= {correctionMode ? "text-red-500" : "text-black"}>
              🖍️ Correct 
              </button>

              {/* Letter content field */}
              
              <div
                onMouseUp={() => {
                  if (!correctionMode) return;

                  const selection = window.getSelection();
                  if (selection && selection.toString().trim()) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();

                    setSelectionInfo({
                      text: selection.toString(),
                      rect,
                    });
                  }
                }}
                className={`w-full h-[70%] p-4 text-gray-800 outline-none rounded cursor-text text-xl leading-loose
                ${correctionMode && "selection:bg-yellow-200" }`}>
                <TextCorrections
                  text={letterContent}
                  corrections={corrections}
                  onCorrectionClick={(correction, rect) => {
                    setEditingCorrection(correction);
                    setcurrentCorrectionText(correction.textCorrected);
                    setSelectionInfo({
                      text: correction.textOriginal,
                      rect
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
                    🖍️ Correcting 
                    </p>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 hover:text-white hover:bg-green-500 hover:rounded"
                      onClick={ () => {
                        console.log("editingcor:" + editingCorrection);
                        if (editingCorrection) {
                          editCorrection();
                          return;
                        }
                        addCorrection();
                        }}/>
                      <Trash className="w-5 h-5 p-0.5 text-red-500 cursor-pointer hover:text-white hover:bg-red-500 hover:rounded"
                        onClick={() => {
                          if (editingCorrection) {
                            setCorrections(corrections.filter(c => c !== editingCorrection));
                            setEditingCorrection(null);
                            setcurrentCorrectionText("");
                            setSelectionInfo(null);
                          }
                        }}
                      />
                      <X
                        onClick={() => {
                          setValuesChanged(true);
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

              <div className="flex flex-row justify-end h-[5%] col items-center gap-4">
                <button
                onClick={() => openDialog({
                  title: "Send Letter",
                  description: "",
                  primaryActionText: "",
                  size: 'md',
                  type: 'shareLetter',
                  autoDismiss: false
                })}>
                  <div className="h-[100%] w-auto flex items-center justify-center bg-[#6495ED] text-white rounded py-2 px-4 hover:bg-[#537dc9] ">
                  📬 Send Back
                  </div>
                </button>
                {valuesChanged && (
                <button onClick={() => {}}>
                    <div className="h-[100%] w-auto flex items-center justify-center bg-[#8EBA03] text-white rounded py-2 px-4 hover:bg-[#708e0b] transition-colors">
                      💾 Save correction
                    </div>
                </button>)}
                {!valuesChanged &&  (
                <div className="text-[#6495ED] display flex items-center gap-2">
                  Letter sent back
                  <Check className="w-5 h-5" />
                </div>)}
                {!valuesChanged &&  (
                <div className="text-[#8EBA03] display flex items-center gap-2">
                  Correction saved
                  <Check className="w-5 h-5" />
                </div>)}
              </div>
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
