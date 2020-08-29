import React, {useContext, useMemo} from "react";
import styled, {ThemeContext} from "styled-components";

import {Link} from "react-router-dom";

interface ButtonProps {
  children?: React.ReactNode;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  text?: string;
  to?: string;
  state?: any;
  variant?: "default" | "secondary" | "tertiary";
}

const Button: React.FC<ButtonProps> = ({
  children,
  disabled,
  href,
  onClick,
  size,
  text,
  to,
  state,
  variant,
}) => {
  const {color, spacing} = useContext(ThemeContext);

  let buttonColor: string;
  switch (variant) {
    case "secondary":
      buttonColor = color.grey[500];
      break;
    case "default":
    default:
      buttonColor = color.primary.main;
  }

  let boxShadow: string;
  let buttonSize: number;
  let buttonPadding: number;
  let fontSize: number;
  switch (size) {
    case "sm":
      buttonPadding = spacing[3];
      buttonSize = 36;
      fontSize = 14;
      break;
    case "lg":
      buttonPadding = spacing[4];
      buttonSize = 72;
      fontSize = 16;
      break;
    case "md":
    default:
      buttonPadding = spacing[4];
      buttonSize = 56;
      fontSize = 16;
  }

  const ButtonChild = useMemo(() => {
    if (to) {
      return <StyledLink to={{pathname: to, state}}>{text}</StyledLink>;
    } else if (href) {
      return (
        <StyledExternalLink href={href} target="__blank">
          {text}
        </StyledExternalLink>
      );
    } else {
      return text;
    }
  }, [href, text, to]);

  return (
    <StyledButton
      boxShadow={boxShadow}
      color={buttonColor}
      disabled={disabled}
      fontSize={fontSize}
      onClick={onClick}
      padding={buttonPadding}
      size={buttonSize}
    >
      {children}
      {ButtonChild}
    </StyledButton>
  );
};

interface StyledButtonProps {
  boxShadow: string;
  color: string;
  disabled?: boolean;
  fontSize: number;
  padding: number;
  size: number;
}

const StyledButton = styled.button<StyledButtonProps>`
  align-items: center;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: ${(props) => props.boxShadow};
  color: #000;
  cursor: pointer;
  display: flex;
  font-size: ${(props) => props.fontSize}px;
  font-weight: 700;
  height: ${(props) => props.size}px;
  justify-content: center;
  outline: none;
  padding-left: ${(props) => props.padding}px;
  padding-right: ${(props) => props.padding}px;
  pointer-events: ${(props) => (!props.disabled ? undefined : "none")};
  width: 100%;
  &:hover {
    background: #eee;
  }
`;

const StyledLink = styled(Link)`
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1;
  height: 56px;
  justify-content: center;
  margin: 0 ${(props) => -props.theme.spacing[4]}px;
  padding: 0 ${(props) => props.theme.spacing[4]}px;
  text-decoration: none;
`;

const StyledExternalLink = styled.a`
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1;
  height: 56px;
  justify-content: center;
  margin: 0 ${(props) => -props.theme.spacing[4]}px;
  padding: 0 ${(props) => props.theme.spacing[4]}px;
  text-decoration: none;
`;

export default Button;
