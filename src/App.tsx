import { useLocale } from "./hooks/useLocale";
import { useEffect, useState } from "react";
import { useMemberDirectory } from "./hooks/useMemberDirectory";
import type { ModalState } from "./types/modal.types";
import BackToTop from "./components/common/BackToTop";
import PageLoader from "./components/common/PageLoader";
import SiteHeader from "./components/layout/SiteHeader";
import SiteFooter from "./components/layout/SiteFooter";
import AppDialog from "./components/dialogs/AppDialog";
import HeroSection from "./components/sections/HeroSection";
import AboutSection from "./components/sections/AboutSection";
import ImpactVideoSection from "./components/sections/ImpactVideoSection";
import CommunityStatsSection from "./components/sections/CommunityStatsSection";
import ActivitiesSection from "./components/sections/ActivitiesSection";
import MembersSection from "./components/sections/MembersSection";
import GallerySection from "./components/sections/GallerySection";
import TestimonialsSection from "./components/sections/TestimonialsSection";
import JoinCommunitySection from "./components/sections/JoinCommunitySection";

const App = () => {
  const { t } = useLocale();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const { memberDirectory, memberLoadStatus, refreshMembers } =
    useMemberDirectory();

  useEffect(() => {
    if (memberLoadStatus !== "loading") setIsInitialLoading(false);
  }, [memberLoadStatus]);

  const handleJoin = () => setActiveModal({ kind: "join" });
  if (isInitialLoading) {
    return <PageLoader />;
  }
  return (
    <>
      <div>
        <a className="skip-link" href="#main">
          {t("navigation.skipToContent")}
        </a>
        <SiteHeader onJoin={handleJoin} />
        <main id="main">
          <HeroSection onJoin={handleJoin} />
          <div className="container">
            <AboutSection onModalChange={setActiveModal} />
            <ImpactVideoSection />
            <CommunityStatsSection memberDirectory={memberDirectory} />
            <ActivitiesSection onModalChange={setActiveModal} />
            <div className="community-sections grid grid-cols-[1fr_1.08fr] gap-8">
              <MembersSection
                memberDirectory={memberDirectory}
                memberLoadStatus={memberLoadStatus}
                onRefreshMembers={refreshMembers}
                onModalChange={setActiveModal}
              />
              <GallerySection onModalChange={setActiveModal} />
            </div>
          </div>
          <TestimonialsSection />
          <JoinCommunitySection onJoin={handleJoin} />
        </main>
        <SiteFooter onJoin={handleJoin} onModalChange={setActiveModal} />
      </div>
      {!activeModal && <BackToTop />}
      <AppDialog
        activeModal={activeModal}
        onModalChange={setActiveModal}
        onJoin={handleJoin}
        memberDirectory={memberDirectory}
        memberLoadStatus={memberLoadStatus}
        onRefreshMembers={refreshMembers}
      />
    </>
  );
};

export default App;
