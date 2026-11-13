import { glossary, type GlossaryTerm } from '../data/glossary.ts'

export function TermTip({ term, align = 'start' }: { term: GlossaryTerm; align?: 'start' | 'end' }) {
  return (
    <details className={`term-tip term-tip-${align}`}>
      <summary aria-label={`Explain ${term}`} title={`Explain ${term}`}>
        <span aria-hidden="true">?</span>
      </summary>
      <span className="term-tip-popover" role="definition">{glossary[term]}</span>
    </details>
  )
}
