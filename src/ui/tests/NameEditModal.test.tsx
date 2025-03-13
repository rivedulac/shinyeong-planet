import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NameEditModal from "../NameEditModal";

vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => {
        if (str === "playerName.editTitle") return "Change Your Explorer Name";
        if (str === "playerName.placeholder") return "Your name here";
        if (str === "playerName.save") return "Save";
        if (str === "playerName.cancel") return "Cancel";
        if (str === "playerName.error") return "Name cannot be empty";
        return str;
      },
    };
  },
}));

describe("NameEditModal", () => {
  it("should render with current name", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <NameEditModal
        currentName="Test Player"
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Check that the title is displayed
    expect(screen.getByText("Change Your Explorer Name")).toBeInTheDocument();

    // Check that input has the current name value
    const input = screen.getByDisplayValue("Test Player");
    expect(input).toBeInTheDocument();

    // Check that buttons are displayed
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should call onSave with new name when submitted", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <NameEditModal
        currentName="Original Name"
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Change the input value
    const input = screen.getByDisplayValue("Original Name");
    fireEvent.change(input, { target: { value: "New Name" } });

    // Submit the form
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    // Check that onSave was called with the new name
    expect(onSave).toHaveBeenCalledWith("New Name");
  });

  it("should call onCancel when cancel button is clicked", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <NameEditModal
        currentName="Test Name"
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Click the cancel button
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Check that onCancel was called
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("should show error when trying to submit empty name", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <NameEditModal
        currentName="Original Name"
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Change the input value to empty
    const input = screen.getByDisplayValue("Original Name");
    fireEvent.change(input, { target: { value: "" } });

    // Submit the form
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    // Check that error is displayed
    expect(screen.getByText("Name cannot be empty")).toBeInTheDocument();

    // Check that onSave was not called
    expect(onSave).not.toHaveBeenCalled();
  });

  it("should trim whitespace when saving", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <NameEditModal
        currentName="Original Name"
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Change the input value with whitespace
    const input = screen.getByDisplayValue("Original Name");
    fireEvent.change(input, { target: { value: "  New Name  " } });

    // Submit the form
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    // Check that onSave was called with trimmed name
    expect(onSave).toHaveBeenCalledWith("New Name");
  });
});
