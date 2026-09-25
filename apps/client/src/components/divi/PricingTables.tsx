import type { ReactNode } from 'react'
import './PricingTables.css'

export type PricingTable = {
  title: string
  /** Divi calls this the "sum"; here it holds a date. */
  sum?: string
  items: ReactNode[]
}

type Props = {
  tables: PricingTable[]
  index: number
}

/**
 * Divi's pricing tables module. On /nyolcadikos/ it is used not for prices but
 * to lay out the admission exam dates side by side.
 */
export default function PricingTables({ tables, index }: Props) {
  return (
    <div
      className={`et_pb_module et_pb_pricing_tables_${index} et_pb_pricing clearfix et_pb_pricing_${tables.length} et_pb_no_featured_in_first_row`}
    >
      <div className="et_pb_pricing_table_wrap">
        {tables.map((table, position) => (
          <div key={table.title} className={`et_pb_pricing_table et_pb_pricing_table_${position}`}>
            <div className="et_pb_pricing_heading">
              <h3 className="et_pb_pricing_title">{table.title}</h3>
            </div>
            {table.sum && (
              <div className="et_pb_pricing_content_top">
                <span className="et_pb_et_price">
                  <span className="et_pb_sum">{table.sum}</span>
                </span>
              </div>
            )}
            <div className="et_pb_pricing_content">
              <ul className="et_pb_pricing">
                {/* The rows are static content with no id of their own, so
                    their position is the only stable key available. */}
                {table.items.map((item, itemIndex) => (
                  <li key={`${table.title}-${itemIndex}`}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
