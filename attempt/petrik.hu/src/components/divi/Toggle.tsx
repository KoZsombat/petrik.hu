import { useState } from 'react'
import type { ReactNode } from 'react'
import './Toggle.css'

type Props = {
  title: string
  children: ReactNode
  /** Divi renders the first toggle of a group open. */
  defaultOpen?: boolean
  index: number
  className?: string
}

/**
 * Divi's toggle module — a disclosure panel.
 *
 * The original opened and closed it with jQuery; here it is a button plus
 * useState, so it works without any script of Divi's.
 */
export default function Toggle({
  title,
  children,
  defaultOpen = false,
  index,
  className,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = `et_pb_toggle_${index}_content`

  const classes = [
    'et_pb_module',
    'et_pb_toggle',
    `et_pb_toggle_${index}`,
    'et_pb_toggle_item',
    open ? 'et_pb_toggle_open' : 'et_pb_toggle_close',
  ]
  if (className) classes.push(className)

  return (
    <div className={classes.join(' ')}>
      <h5 className="et_pb_toggle_title">
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)}>
          {title}
        </button>
      </h5>
      <div id={panelId} className="et_pb_toggle_content clearfix" hidden={!open}>
        {children}
      </div>
    </div>
  )
}
