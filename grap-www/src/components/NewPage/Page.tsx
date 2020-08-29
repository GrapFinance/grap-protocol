import React from "react";
import styled from "styled-components";

import Footer from "../Footer";
import TopBar from "../NewTopBar";

const Page: React.FC = ({children}) => (
  <StyledPage>
    <TopBar />
    <StyledMain>{children}</StyledMain>
    <Footer />
  </StyledPage>
);

const StyledPage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #470024;
  overflow: auto;
  color: #fff;
`;

const StyledMain = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 83.333%;
  max-width: 1200px;
  margin: 0 auto;
`;

export default Page;
