import { Link } from 'react-router-dom'
import './CalendarWidget.css'

const WEEKDAY_INITIALS = ['h', 'K', 's', 'c', 'p', 's', 'v'] as const
const WEEKDAY_NAMES = [
  'hétfő',
  'kedd',
  'szerda',
  'csütörtök',
  'péntek',
  'szombat',
  'vasárnap',
] as const
const MONTH_NAMES = [
  'január',
  'február',
  'március',
  'április',
  'május',
  'június',
  'július',
  'augusztus',
  'szeptember',
  'október',
  'november',
  'december',
] as const

type Props = {
  /** Month to render, 1-12. */
  month: number
  year: number
  /** Days of this month that have at least one post, so they link to an archive. */
  postDays?: number[]
  /** Day to mark as today, if it falls in this month. */
  today?: number
}

/** Days in `month`, where `month` is 1-12. */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** Weekday index of the 1st, Monday-first (0 = Monday), as WordPress renders it. */
function firstWeekdayIndex(year: number, month: number): number {
  return (new Date(year, month - 1, 1).getDay() + 6) % 7
}

/**
 * The footer's "Hírek napi bontásban" widget — a plain month grid where days
 * with posts link to their date archive. WordPress built this with a PHP
 * calendar; here it is derived from the month and the list of days with posts.
 */
export default function CalendarWidget({ month, year, postDays = [], today }: Props) {
  const total = daysInMonth(year, month)
  const offset = firstWeekdayIndex(year, month)
  const withPosts = new Set(postDays)
  const monthPath = `/${year}/${String(month).padStart(2, '0')}/`

  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, index) => index + 1),
  ]
  const weeks: (number | null)[][] = []
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7))
  }
  const lastWeek = weeks[weeks.length - 1]
  const trailing = 7 - lastWeek.length

  const previousMonth = month === 1 ? 12 : month - 1
  const previousYear = month === 1 ? year - 1 : year

  return (
    <div id="calendar_wrap" className="calendar_wrap">
      <table id="wp-calendar" className="wp-calendar-table">
        <caption>{`${year}. ${MONTH_NAMES[month - 1]}`}</caption>
        <thead>
          <tr>
            {WEEKDAY_INITIALS.map((initial, index) => (
              <th key={WEEKDAY_NAMES[index]} scope="col" aria-label={WEEKDAY_NAMES[index]}>
                {initial}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={week.find((day) => day !== null) ?? weekIndex}>
              {weekIndex === 0 && offset > 0 && (
                <td colSpan={offset} className="pad">
                  &nbsp;
                </td>
              )}
              {week
                .filter((day): day is number => day !== null)
                .map((day) => (
                  <td key={day} id={day === today ? 'today' : undefined}>
                    {withPosts.has(day) ? (
                      <Link
                        to={`${monthPath}${String(day).padStart(2, '0')}/`}
                        aria-label={`Bejegyzések közzétéve: ${year}. ${MONTH_NAMES[month - 1]} ${day}.`}
                      >
                        {day}
                      </Link>
                    ) : (
                      day
                    )}
                  </td>
                ))}
              {weekIndex === weeks.length - 1 && trailing > 0 && (
                <td className="pad" colSpan={trailing}>
                  &nbsp;
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <nav aria-label="Előző és következő hónapok" className="wp-calendar-nav">
        <span className="wp-calendar-nav-prev">
          <Link to={`/${previousYear}/${String(previousMonth).padStart(2, '0')}/`}>
            {`« ${MONTH_NAMES[previousMonth - 1].slice(0, 3)}`}
          </Link>
        </span>
        <span className="pad">&nbsp;</span>
        <span className="wp-calendar-nav-next">&nbsp;</span>
      </nav>
    </div>
  )
}
