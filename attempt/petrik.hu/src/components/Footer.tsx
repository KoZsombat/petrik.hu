import { calendarTitle, categoriesTitle, categoryTree, contactParagraphs, contactTitle } from '../data/footer.ts'
import { footerInfo } from '../data/site.ts'
import CalendarWidget from './CalendarWidget.tsx'
import CategoryTree from './CategoryTree.tsx'
import SocialIcons from './SocialIcons.tsx'
import { Fragment } from 'react'
import './Footer.css'

/**
 * The month the mirror was captured, and the days that had posts. The original
 * calendar was generated server-side from the live post list; with a single
 * post in scope these come from the snapshot instead.
 */
const SNAPSHOT = { year: 2026, month: 9, today: 17, postDays: [8, 9, 11, 15] }

export default function Footer() {
  return (
    <footer id="main-footer">
      <div className="container">
        <div id="footer-widgets" className="clearfix">
          <div className="footer-widget">
            <div className="fwidget et_pb_widget widget_calendar">
              <h4 className="title">{calendarTitle}</h4>
              <CalendarWidget {...SNAPSHOT} />
            </div>
          </div>
          <div className="footer-widget">
            <div className="fwidget et_pb_widget widget_categories">
              <h4 className="title">{categoriesTitle}</h4>
              <CategoryTree items={categoryTree} />
            </div>
          </div>
          <div className="footer-widget">
            <div className="fwidget et_pb_widget widget_text">
              <h4 className="title">{contactTitle}</h4>
              <div className="textwidget">
                {contactParagraphs.map((lines) => (
                  <p key={lines[0]}>
                    {lines.map((line, index) => (
                      <Fragment key={line}>
                        {index > 0 && <br />}
                        {line}
                      </Fragment>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="footer-bottom">
        <div className="container clearfix">
          <SocialIcons />
          <div id="footer-info">{footerInfo}</div>
        </div>
      </div>
    </footer>
  )
}
