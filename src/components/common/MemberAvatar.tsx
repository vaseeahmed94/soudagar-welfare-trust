import type { PublicMember } from "../../types/membership.types";

const MemberAvatar = ({ member }: { member: PublicMember }) => {
  const nameInitial =
    Array.from(member.name.trim())[0]?.toLocaleUpperCase() ?? "?";
  return (
    <figure className="member-profile m-0 min-w-0 flex-1 text-center">
      <div
        className="member-avatar grid aspect-square place-items-center overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <span>{nameInitial}</span>
      </div>
      <figcaption>{member.name}</figcaption>
    </figure>
  );
};

export default MemberAvatar;
