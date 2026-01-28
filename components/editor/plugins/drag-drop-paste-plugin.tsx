"use client"

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { DRAG_DROP_PASTE } from "@lexical/rich-text"
import { isMimeType } from "@lexical/utils"
import { COMMAND_PRIORITY_LOW } from "lexical"

import { INSERT_IMAGE_COMMAND } from "@/components/editor/plugins/images-plugin"

const ACCEPTABLE_IMAGE_TYPES = [
  "image/",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/webp",
]

export function DragDropPastePlugin(): null {
  const [editor] = useLexicalComposerContext()
  
  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
        ;(async () => {
          for (const file of Array.from(files)) {
            if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
              try {
                // Upload file via media management API (not base64)
                const formData = new FormData()
                formData.append("file", file)
                
                const response = await fetch("/api/media/upload", {
                  method: "POST",
                  body: formData,
                })
                
                const result = await response.json()
                
                if (result.success && result.media && result.media.url) {
                  // Use the relative URL from media management system (not base64)
                  // Ensure URL is normalized (starts with / if relative)
                  const imageUrl = result.media.url.startsWith("http") 
                    ? result.media.url 
                    : result.media.url.startsWith("/") 
                      ? result.media.url 
                      : `/${result.media.url}`
                  
                  editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                    altText: result.media.name || file.name || "Image",
                    src: imageUrl,
                  })
                } else {
                  console.error("Upload failed:", result.error)
                  // Don't insert broken images - user can add via MediaPicker
                }
              } catch (error) {
                console.error("Error uploading image:", error)
                // Don't insert broken images - user can add via MediaPicker
              }
            }
          }
        })()
        return true
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])
  return null
}
