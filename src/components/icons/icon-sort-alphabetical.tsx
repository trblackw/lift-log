export default function IconSortAlphabetical({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M2 17L5.75 7H7.9l3.75 10H9.6l-.85-2.4H4.9L4.1 17zm3.5-4.1h2.6L6.9 9.15h-.15zm8.2 4.1v-1.9l5.05-6.3H13.9V7h7.05v1.9l-5 6.3H21V17zM9 5l3-3l3 3zm3 17l-3-3h6z"
      />
    </svg>
  );
}
