package com.botcab.driver;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private DriverStatus status;

    protected Driver() {
    }

    public Driver(String fullName, String phone, String passwordHash) {
        this.fullName = fullName;
        this.phone = phone;
        this.passwordHash = passwordHash;
        this.status = DriverStatus.OFFLINE;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhone() {
        return phone;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public DriverStatus getStatus() {
        return status;
    }

    public void goAvailable() {
        this.status = DriverStatus.AVAILABLE;
    }

    public void goOffline() {
        this.status = DriverStatus.OFFLINE;
    }

    public void markBusy() {
        this.status = DriverStatus.BUSY;
    }
}
