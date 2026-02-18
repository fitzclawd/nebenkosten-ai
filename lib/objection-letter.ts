interface ObjectionLetterData {
  landlordName: string
  tenantName: string
  tenantAddress: string
  billingPeriod: string
  billDate?: string
  errors: Array<{
    name: string
    total_cost: number
    error_details: string
    error_type: string
  }>
  estimatedRefund: number
}

export function generateObjectionLetter(data: ObjectionLetterData): string {
  const currentDate = new Date().toLocaleDateString('de-DE')
  
  const formalErrors = data.errors.filter(e => e.error_type === 'formal_error')
  const outliers = data.errors.filter(e => e.error_type === 'outlier')
  
  let letter = `Widerspruch gegen die Betriebskostenabrechnung


${data.tenantName}
${data.tenantAddress}


${data.landlordName}


${currentDate}


Betreff: Widerspruch gegen die Betriebskostenabrechnung für den Zeitraum ${data.billingPeriod}


Sehr geehrte Damen und Herren,

hiermit lege ich Widerspruch gegen die mir zugegangene Betriebskostenabrechnung für den Zeitraum ${data.billingPeriod} ein.

`

  if (formalErrors.length > 0) {
    letter += `Die Abrechnung enthält folgende nicht umlagefähige Kosten (§ 2 BetrKV):

`
    formalErrors.forEach((error, index) => {
      letter += `${index + 1}. ${error.name}: €${error.total_cost?.toFixed(2) || '0.00'}
   Begründung: ${error.error_details}

`
    })
  }

  if (outliers.length > 0) {
    letter += `\nZusätzlich weise ich auf folgende auffällige Kosten hin, die im Vergleich zu ortsüblichen Durchschnittskosten unverhältnismäßig hoch erscheinen:

`
    outliers.forEach((error, index) => {
      letter += `${index + 1}. ${error.name}: €${error.total_cost?.toFixed(2) || '0.00'}
   Anmerkung: ${error.error_details}

`
    })
  }

  letter += `Ich bitte um:
1. Überprüfung der genannten Positionen
2. Berichtigung der Abrechnung unter Ausschluss der nicht umlagefähigen Kosten
3. Rückerstattung der zu viel gezahlten Kosten in Höhe von ca. €${data.estimatedRefund.toFixed(2)}
4. Zusendung einer korrigierten Abrechnung innerhalb von 4 Wochen

Sollten Sie meinem Widerspruch nicht nachkommen, behalte ich mir vor, rechtliche Schritte einzuleiten und die Abrechnung durch einen Sachverständigen prüfen zu lassen.

Bitte bestätigen Sie den Erhalt dieses Schreibens.

Mit freundlichen Grüßen


${data.tenantName}


---
Hinweis: Dieser Entwurf wurde mit Hilfe einer automatisierten Analyse erstellt und dient als Grundlage für Ihre Überlegungen. Es handelt sich nicht um Rechtsberatung. Für verbindliche Aussagen konsultieren Sie bitte einen Rechtsanwalt oder Mieterverein.
`

  return letter
}

export function generateEnglishObjectionLetter(data: ObjectionLetterData): string {
  const currentDate = new Date().toLocaleDateString('en-US')
  
  const formalErrors = data.errors.filter(e => e.error_type === 'formal_error')
  const outliers = data.errors.filter(e => e.error_type === 'outlier')
  
  let letter = `OBJECTION TO UTILITY BILL CHARGES


${data.tenantName}
${data.tenantAddress}


${data.landlordName}


${currentDate}


Subject: Objection to Utility Bill (Betriebskostenabrechnung) for Period ${data.billingPeriod}


Dear Sir/Madam,

I hereby formally object to the utility bill I received for the period ${data.billingPeriod}.

`

  if (formalErrors.length > 0) {
    letter += `The bill contains the following non-allocable charges (§ 2 BetrKV):

`
    formalErrors.forEach((error, index) => {
      letter += `${index + 1}. ${error.name}: €${error.total_cost?.toFixed(2) || '0.00'}
   Reason: ${error.error_details}

`
    })
  }

  if (outliers.length > 0) {
    letter += `\nAdditionally, I would like to point out the following unusually high costs:

`
    outliers.forEach((error, index) => {
      letter += `${index + 1}. ${error.name}: €${error.total_cost?.toFixed(2) || '0.00'}
   Note: ${error.error_details}

`
    })
  }

  letter += `I kindly request:
1. Review of the mentioned items
2. Correction of the bill excluding non-allocable charges
3. Refund of overpaid costs amounting to approximately €${data.estimatedRefund.toFixed(2)}
4. Submission of a corrected bill within 4 weeks

Should you not comply with this objection, I reserve the right to take legal action and have the bill reviewed by an expert.

Please confirm receipt of this letter.

Sincerely,


${data.tenantName}


---
Disclaimer: This draft was created using automated analysis and serves as a basis for your consideration. It does not constitute legal advice. For binding statements, please consult a lawyer or tenant association.
`

  return letter
}
