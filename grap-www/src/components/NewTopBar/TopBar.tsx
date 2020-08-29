import React from "react";
import styled from "styled-components";

import Container from "../Container";
import Logo from "../Logo";

import Nav from "./components/Nav";

const TopBar: React.FC = () => {
  return (
    <StyledTopBar>
      <Container size="lg">
        <StyledTopBarInner>
          <div style={{flex: 1}}></div>
          <Nav />
        </StyledTopBarInner>
      </Container>
    </StyledTopBar>
  );
};

const StyledTopBar = styled.div``;

const StyledTopBarInner = styled.div`
  align-items: center;
  display: flex;
  height: ${(props) => props.theme.topBarSize}px;
  justify-content: space-between;
  max-width: ${(props) => props.theme.siteWidth}px;
  width: 100%;
`;

export default TopBar;
