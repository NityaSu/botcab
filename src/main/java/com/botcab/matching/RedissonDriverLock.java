package com.botcab.matching;

import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class RedissonDriverLock implements DriverLock {

    /** Same window Phase 3 will use for "accept this offer". */
    static final long LEASE_SECONDS = 15;

    private final RedissonClient redisson;

    public RedissonDriverLock(RedissonClient redisson) {
        this.redisson = redisson;
    }

    @Override
    public boolean tryAcquire(long driverId) {
        RLock lock = redisson.getLock("lock:driver:" + driverId);
        try {
            return lock.tryLock(0, LEASE_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
}
