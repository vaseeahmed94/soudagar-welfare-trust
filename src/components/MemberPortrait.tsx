import type { PublicMember } from "../services/membership";

export default function MemberPortrait({ member }: { member: PublicMember }) {
  const initial = Array.from(member.name.trim())[0]?.toLocaleUpperCase() ?? "?";
  return (
    <figure className="member-profile">
      <div className="member-avatar" aria-hidden="true">
        <span>{initial}</span>
      </div>
      <figcaption>{member.name}</figcaption>
    </figure>
  );
}
