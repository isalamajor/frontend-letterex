"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertTriangle, CircleX, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getFriendsList } from '@/services/api'
import FriendsCheckboxList from '@/components/ui/friendsCheckBoxList'
import { shareLetter } from '@/services/api'

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface Friend {
  _id: string;
  nickname: string;
  image?: string;
  alreadySent?: boolean;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => onOpenChange(false)}>
      {children}
    </div>
  );
};

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className, ...props }) => {
  
  return (
    <div
      className={`relative z-50 grid w-full gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full ${className}`}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside content
      {...props}
    >
      {children}
    </div>
  );
};

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className, ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props}>
      {children}
    </div>
  );
};

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className, ...props }) => {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h2>
  );
};

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className, ...props }) => {
  return (
    <p className={`text-sm text-muted-foreground ${className}`} {...props}>
      {children}
    </p>
  );
};


export type DialogType = 'success' | 'alert' | 'error' | 'shareLetter'

interface SuccessDialogProps {
  isOpen?: boolean
  onClose?: () => void
  title?: string
  description?: string
  primaryActionText?: string
  onPrimaryAction?: () => void
  autoDismiss?: boolean
  autoDismissDelay?: number
  showCloseButton?: boolean
  size?: 'sm' | 'md' | 'lg'
  type?: DialogType
  letterId?: string
  sharedWith?: string[]
  onShareSuccess?: () => void
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({
  isOpen = true,
  onClose = () => {},
  title = "Success!",
  description = "Your action has been completed successfully.",
  primaryActionText = "Continue",
  onPrimaryAction = () => {},
  autoDismiss = false,
  autoDismissDelay = 3000,
  showCloseButton = true,
  size = 'md',
  type = 'success', // Default to success
  letterId = '',
  sharedWith = [],
  onShareSuccess = () => {}
}) => {
  const [internalOpen, setInternalOpen] = useState(isOpen)
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [friendsSelected, setFriendsSelected] = useState<string[]>([]);
  const primaryButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  }

  const typeConfig = {
    success: {
      icon: Check,
      iconBgClass: 'bg-green-100 dark:bg-green-900/20',
      iconColorClass: 'text-green-600 dark:text-green-400',
      titleDefault: "Success!",
      descriptionDefault: "Your action has been completed successfully.",
      buttonClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
    alert: {
      icon: AlertTriangle,
      iconBgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColorClass: 'text-yellow-600 dark:text-yellow-400',
      titleDefault: "Heads Up!",
      descriptionDefault: "Please review the information provided.",
      buttonClass: 'bg-yellow-600 text-white hover:bg-yellow-700',
    },
    error: {
      icon: CircleX,
      iconBgClass: 'bg-red-100 dark:bg-red-900/20',
      iconColorClass: 'text-red-600 dark:text-red-400',
      titleDefault: "Error!",
      descriptionDefault: "Something went wrong. Please try again.",
      buttonClass: 'bg-red-600 text-white hover:bg-red-700',
    },
    shareLetter: {
      icon: Send,
      iconBgClass: 'bg-blue-100 dark:bg-blue-900/20',
      iconColorClass: 'text-blue-600 dark:text-blue-400',
      titleDefault: "Send this letter to friends",
      descriptionDefault: "They can check your letter and send a correction back :)",
      buttonClass: 'bg-blue-600 text-white hover:bg-blue-700',
    },
  }

  const currentConfig = typeConfig[type]
  const IconComponent = currentConfig.icon

  const handleClose = useCallback(() => {
    setInternalOpen(false)
    onClose()
    
    // Return focus to the previously active element
    if (previousActiveElement.current) {
      previousActiveElement.current.focus()
    }
  }, [onClose])

  const handlePrimaryAction = useCallback(() => {
    onPrimaryAction()
    handleClose()
  }, [onPrimaryAction, handleClose])

  const handleShareLetter = async() => {
    if (friendsSelected.length === 0) {
      alert("Please select at least one friend to share the letter with.")
      return
    }
    // Implement share letter logic here
    console.log("Sharing letter with friends:", friendsSelected);
    
    const shareLetterResult = await shareLetter(letterId, friendsSelected);
    if (shareLetterResult === 0) {
      alert("Letter shared successfully!");
      if (onShareSuccess) {
        onShareSuccess();
      }
      handleClose();
    } else {
      alert("Failed to share letter. Please try again.");
    }
    
  }

  // Store the previously focused element when dialog opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      setInternalOpen(true)
    } else {
      setInternalOpen(false)
    }
  }, [isOpen])

  // Auto-dismiss functionality
  useEffect(() => {
    if (internalOpen && autoDismiss && autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoDismissDelay)

      return () => clearTimeout(timer)
    }
  }, [internalOpen, autoDismiss, autoDismissDelay, handleClose])

  // Focus management
  useEffect(() => {
    if (internalOpen) {
      // Focus the primary button when dialog opens
      const timer = setTimeout(() => {
        primaryButtonRef.current?.focus()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [internalOpen])


  useEffect(() => {
    const fetchFriendsList = async () => {
      try {
        const friends = await getFriendsList();
        
        // Mark with alreadySent property
        const friendsWithStatus = friends.map((friend: Friend) => ({
          ...friend,
          alreadySent: sharedWith.includes(friend._id)
        }));
        setFriendsList(friendsWithStatus); 
        console.log("Fetched friends list:", friends);
      } catch (error) {
        console.error("Error fetching friends list:", error);
      }
    };

    if (type === 'shareLetter' && isOpen) {
      fetchFriendsList();

    }
  }, [type, isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose()
    } else if (event.key === 'Tab') {
      // Simple focus trapping between close button and primary button
      const focusableElements = [closeButtonRef.current, primaryButtonRef.current].filter(Boolean) as HTMLElement[]
      const currentIndex = focusableElements.findIndex(el => el === document.activeElement)
      
      if (focusableElements.length === 0) return; // No focusable elements

      if (event.shiftKey) {
        // Shift + Tab (backwards)
        event.preventDefault()
        const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
        focusableElements[prevIndex]?.focus()
      } else {
        // Tab (forwards)
        event.preventDefault()
        const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1
        focusableElements[nextIndex]?.focus()
      }
    }
  }, [handleClose])

  // Fallback for missing content
  const displayTitle = title?.trim() || currentConfig.titleDefault
  const displayDescription = description?.trim() || currentConfig.descriptionDefault
  const displayPrimaryActionText = primaryActionText?.trim() || "OK"



  return (
    <Dialog open={internalOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={`${sizeClasses[size]} p-0 overflow-hidden border-border bg-background bg-white`}
        onKeyDown={handleKeyDown}
        aria-labelledby="success-dialog-title"
        aria-describedby="success-dialog-description"
      >
        <AnimatePresence>
          {internalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ 
                duration: 0.2, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="relative"
            >
              {/* Close button */}
              {showCloseButton && (
                <button
                  ref={closeButtonRef}
                  onClick={handleClose}
                  className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              { type === 'shareLetter' && (
                
              <div className="flex flex-col items-center text-center p-6 pt-8 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Share with friends
                  </h3>
                    
    
                    
                    {friendsList.length === 0 ? (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          First add some friends to share with!
                        </p>
                        <div className="flex justify-center items-center gap-4 pt-4">
                        <Button
                          onClick={handlePrimaryAction}
                          className={`min-w-[120px] bg-[#ACB0AC] text-white rounded py-2 px-4 hover:bg-[#537dc9] transition-colors`}
                          size="default"
                        > Cancel
                        </Button>
                        <Button
                          onClick={handlePrimaryAction}
                          className={`min-w-[120px] transition-all duration-200 ${currentConfig.buttonClass}`}
                          size="default"
                        > Discover new people
                        </Button>
                        </div>
                      </div>
                    )
                    : (
                      <div>
                      <FriendsCheckboxList
                      friends={friendsList}
                      selected={friendsSelected}
                      setSelected={setFriendsSelected}
                      />
                      <div className="flex justify-center items-center gap-4 pt-4">
                      <Button
                          onClick={handlePrimaryAction}
                          className={`min-w-[120px] bg-[#ACB0AC] text-white rounded py-2 px-4 hover:bg-[#537dc9] transition-colors`}
                          size="default"
                        > Cancel
                      </Button>
                      <Button
                          onClick={handleShareLetter}
                          className={`min-w-[120px] bg-[#6495ED] text-white rounded py-2 px-4 hover:bg-[#537dc9] transition-colors`}
                          size="default"
                        > Share 📩
                      </Button>
                      </div>
                      </div>
                    )
                      }
                </div>
              )}

              {type !== 'shareLetter' && (
              <div className="flex flex-col items-center text-center p-6 pt-8 space-y-4">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.1, 
                    duration: 0.3, 
                    type: "spring", 
                    stiffness: 200 
                  }}
                  className={`flex items-center justify-center w-16 h-16 rounded-full ${currentConfig.iconBgClass}`}
                >
                  <IconComponent className={`w-8 h-8 ${currentConfig.iconColorClass}`} />
                </motion.div>

                {/* Title */}
                <DialogHeader className="space-y-2 display-inline-flex items-center justify-center">
                  <DialogTitle 
                    id="success-dialog-title"
                    className="text-xl font-semibold text-black"
                  >
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {displayTitle}
                    </motion.span>
                  </DialogTitle>

                  {/* Description */}
                  <DialogDescription 
                    id="success-dialog-description"
                    className="text-muted-foreground max-w-sm mx-auto leading-relaxed"
                  >
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      {displayDescription}
                    </motion.span>
                  </DialogDescription>
                </DialogHeader>

                {/* Primary Action Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="pt-2"
                >
                  <Button
                    onClick={handlePrimaryAction}
                    className={`min-w-[120px] focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 ${currentConfig.buttonClass}`}
                    size="default"
                  >
                    {displayPrimaryActionText}
                  </Button>
                </motion.div>

                {/* Auto-dismiss indicator 
                {autoDismiss && autoDismissDelay > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="text-xs text-muted-foreground"
                  >
                    Auto-closing in {Math.ceil(autoDismissDelay / 1000)} seconds
                  </motion.div>
                )}*/}
              </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}


export default {SuccessDialog, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription}
