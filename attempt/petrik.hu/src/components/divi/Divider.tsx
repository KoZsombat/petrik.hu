import './Divider.css'

type Props = {
  /** Divi numbers dividers per page so the design stylesheet can target them. */
  index: number
}

/** Divi's divider module: a horizontal rule drawn with a ::before border. */
export default function Divider({ index }: Props) {
  return (
    <div className={`et_pb_module et_pb_divider et_pb_divider_${index} et_pb_space`}>
      <div className="et_pb_divider_internal" />
    </div>
  )
}
