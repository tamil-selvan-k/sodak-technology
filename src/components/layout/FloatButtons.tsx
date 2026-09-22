export default function FloatButtons() {
  return (
    <div className="float-btns">
      <a
        href="https://wa.me/918939366259?text=Hi%20SODAK%20Team%2C%20I%20want%20to%20enquire%20about%20campus%20training."
        target="_blank"
        rel="noopener noreferrer"
        className="float-btn"
        style={{ background: '#25d366' }}
        title="WhatsApp us"
        aria-label="Chat on WhatsApp"
      >
        💬
      </a>
      <a
        href="tel:+918939366259"
        className="float-btn"
        style={{ background: 'var(--gold-500)' }}
        title="Call us"
        aria-label="Call SODAK Technology"
      >
        📞
      </a>
    </div>
  )
}
