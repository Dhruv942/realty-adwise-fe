type Props = {
  eyebrow: string;
  title: string;
  lede: string;
  children: React.ReactNode;
};

export function AuthLayout({ eyebrow, title, lede, children }: Props) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <p className="eyebrow">Realty Adwise</p>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{lede}</p>
        </div>
        <p className="muted" style={{ color: "#8e8c87", fontSize: 13 }}>
          Andheri West, Mumbai
        </p>
      </aside>
      <main className="auth-main">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
