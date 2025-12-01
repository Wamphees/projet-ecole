import Tab from "~/components/espace_perso_component/section-layout";

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full pt-1 pb-1 max-w-270 mt-10 px-12">
            <Tab />
        </div>
      </div>
    </>
  );
}
